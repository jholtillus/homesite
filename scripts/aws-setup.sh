#!/usr/bin/env bash
# Moves jordanholt.art onto AWS and connects everything to the new sites.
# Written for AWS CloudShell (it already has the AWS CLI, SAM CLI, Python and git, and is signed in).
#
#   bash scripts/aws-setup.sh            # run every step (safe to run again; finished steps are skipped)
#   bash scripts/aws-setup.sh status     # show where things stand
#
# What it does:
#   1. Route 53 hosted zone for the domain (prints the nameservers to enter at your registrar)
#   2. Copies DNS records you list in infra/dns-records.txt (email etc.) into Route 53
#   3. Amplify: finds the main site app, creates the Theseus and Panomachea apps, sets their settings
#   4. Amplify custom domains: jordanholt.art + www, theseus.jordanholt.art, panomachea.jordanholt.art
#   5. SES: verifies the domain (DKIM records go into Route 53) and the address that receives enquiries
#   6. Deploys the contact-form / newsletter / news-feed API (infra/template.yaml, API only)
#   7. Gives the main site the API address and rebuilds all three sites
#
# Optional settings (environment variables):
#   DOMAIN=jordanholt.art  REPO=https://github.com/jholtillus/homesite  BRANCH=main
#   CONTACT_TO=jholt@carthageworkshop.com  CONTACT_FROM=no-reply@jordanholt.art
#   MAIN_APP_ID=<id>   only needed if the script can't tell which Amplify app is the main site
#   GITHUB_TOKEN=...   GitHub token (classic, scopes: repo, admin:repo_hook); asked for if needed
#   SHOPIFY_ADMIN_TOKEN=...  Shopify Admin API token (write_customers); asked for if needed
set -euo pipefail

DOMAIN="${DOMAIN:-jordanholt.art}"
REPO="${REPO:-https://github.com/jholtillus/homesite}"
BRANCH="${BRANCH:-main}"
CONTACT_TO="${CONTACT_TO:-jholt@carthageworkshop.com}"
CONTACT_FROM="${CONTACT_FROM:-no-reply@$DOMAIN}"
STACK="${STACK:-jordanholt-api}"
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region 2>/dev/null || true)}}"
REGION="${REGION:-us-east-1}"
export AWS_REGION="$REGION" AWS_DEFAULT_REGION="$REGION" AWS_PAGER=""
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

say()  { printf '\n\033[1m== %s\033[0m\n' "$*"; }
info() { printf '   %s\n' "$*"; }
warn() { printf '   \033[33m! %s\033[0m\n' "$*"; }
die()  { printf '\n\033[31mStopped: %s\033[0m\n' "$*" >&2; exit 1; }
py()   { python3 -c "$@"; }

for c in aws python3; do command -v "$c" >/dev/null || die "'$c' is not installed (run this in AWS CloudShell)."; done
ACCOUNT=$(aws sts get-caller-identity --query Account --output text) || die "AWS CLI is not signed in."

zone_id() { aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN." --query "HostedZones[?Name=='$DOMAIN.'] | [0].Id" --output text | sed 's#/hostedzone/##; s/^None$//'; }
app_id()  { aws amplify list-apps --query "apps[?name=='$1'] | [0].appId" --output text | sed 's/^None$//'; }

# ---------------------------------------------------------------- status
status() {
  say "Status ($DOMAIN, account $ACCOUNT, region $REGION)"
  local z; z=$(zone_id)
  if [ -n "$z" ]; then
    info "Route 53 zone: $z"
    info "Nameservers to set at your registrar:"
    aws route53 get-hosted-zone --id "$z" --query 'DelegationSet.NameServers' --output text | tr '\t' '\n' | sed 's/^/     /'
    info "Nameservers the internet currently sees:"
    (command -v dig >/dev/null && dig +short NS "$DOMAIN" | sed 's/^/     /') || info "     (dig not available)"
  else
    info "Route 53 zone: not created yet"
  fi
  for id in $(aws amplify list-apps --query 'apps[].appId' --output text); do
    local name; name=$(aws amplify get-app --app-id "$id" --query app.name --output text)
    aws amplify list-domain-associations --app-id "$id" \
      --query 'domainAssociations[].[domainName,domainStatus,statusReason]' --output text 2>/dev/null |
      while IFS=$'\t' read -r d s r; do info "Amplify $name: $d -> $s ${r:+($r)}"; done
  done
  for ident in "$DOMAIN" "$CONTACT_TO"; do
    local v; v=$(aws sesv2 get-email-identity --email-identity "$ident" --query VerifiedForSendingStatus --output text 2>/dev/null || echo "not created")
    info "SES $ident verified: $v"
  done
  info "SES production access: $(aws sesv2 get-account --query ProductionAccessEnabled --output text 2>/dev/null || echo unknown)"
  local api; api=$(aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text 2>/dev/null || true)
  info "Form API: ${api:-not deployed}"
}
if [ "${1:-}" = "status" ]; then status; exit 0; fi

say "Account $ACCOUNT, region $REGION, domain $DOMAIN"

# ---------------------------------------------------------------- 1. hosted zone
say "1. Route 53 hosted zone"
ZONE=$(zone_id)
if [ -z "$ZONE" ]; then
  ZONE=$(aws route53 create-hosted-zone --name "$DOMAIN" --caller-reference "setup-$(date +%s)" --query HostedZone.Id --output text | sed 's#/hostedzone/##')
  info "Created zone $ZONE"
else
  info "Zone exists: $ZONE"
fi
NS=$(aws route53 get-hosted-zone --id "$ZONE" --query 'DelegationSet.NameServers' --output text | tr '\t' '\n')

upsert() { # name type ttl value [value...]
  local name=$1 type=$2 ttl=$3; shift 3
  local batch; batch=$(py 'import json,sys
n,t,ttl,*vals=sys.argv[1:]
print(json.dumps({"Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":n,"Type":t,"TTL":int(ttl),"ResourceRecords":[{"Value":v} for v in vals]}}]}))' "$name" "$type" "$ttl" "$@")
  aws route53 change-resource-record-sets --hosted-zone-id "$ZONE" --change-batch "$batch" >/dev/null
}

# ---------------------------------------------------------------- 2. existing records
say "2. Existing DNS records (email etc.)"
RECORDS="$ROOT/infra/dns-records.txt"
if [ -f "$RECORDS" ]; then
  # One record per line: NAME TYPE TTL VALUE   (several lines with the same NAME+TYPE are combined)
  # e.g.  jordanholt.art MX 3600 10 mx1.example.com
  #       jordanholt.art TXT 3600 "v=spf1 include:example.com ~all"
  py 'import sys,collections,json
recs=collections.OrderedDict()
for line in open(sys.argv[1]):
    line=line.strip()
    if not line or line.startswith("#"): continue
    n,t,ttl,v=line.split(None,3)
    recs.setdefault((n,t.upper(),ttl),[]).append(v)
for (n,t,ttl),vals in recs.items(): print(json.dumps([n,t,ttl]+vals))' "$RECORDS" | while read -r row; do
    mapfile -t args < <(py 'import json,sys; print("\n".join(json.loads(sys.argv[1])))' "$row")
    upsert "${args[@]}"; info "Added ${args[0]} ${args[1]}"
  done
else
  info "No infra/dns-records.txt; skipping. (Add your email records there and run again if the domain receives mail.)"
fi

say "ACTION AT YOUR REGISTRAR: set these nameservers for $DOMAIN"
echo "$NS" | sed 's/^/     /'
info "Amplify keeps checking until they take effect, so carry on; this script does not need to wait."

# ---------------------------------------------------------------- 3. Amplify apps
say "3. Amplify apps"
env_merge() { # app-id KEY=VALUE...  -> merges into the app's environment variables
  local id=$1; shift
  local cur; cur=$(aws amplify get-app --app-id "$id" --query 'app.environmentVariables' --output json)
  local merged; merged=$(py 'import json,sys
cur=json.loads(sys.argv[1]) or {}
for kv in sys.argv[2:]:
    k,v=kv.split("=",1); cur[k]=v
print(json.dumps(cur))' "$cur" "$@")
  aws amplify update-app --app-id "$id" --environment-variables "$merged" >/dev/null
}

MAIN="${MAIN_APP_ID:-}"
if [ -z "$MAIN" ]; then
  mapfile -t cands < <(aws amplify list-apps --output json | py 'import json,sys
for a in json.load(sys.stdin)["apps"]:
    if a.get("repository","").rstrip("/").removesuffix(".git").lower()==sys.argv[1].lower() and (a.get("environmentVariables") or {}).get("SITE","") in ("",):
        print(a["appId"]+" "+a["name"])' "${REPO%/}")
  [ "${#cands[@]}" -eq 1 ] || die "Found ${#cands[@]} Amplify apps for $REPO without SITE set. Re-run with MAIN_APP_ID=<the main site's app id>."
  MAIN=${cands[0]%% *}
fi
info "Main site app: $MAIN ($(aws amplify get-app --app-id "$MAIN" --query app.name --output text))"

ensure_app() { # name site urlvar
  local name=$1 site=$2 urlvar=$3 id
  id=$(app_id "$name")
  if [ -z "$id" ]; then
    if [ -z "${GITHUB_TOKEN:-}" ]; then read -rsp "   GitHub token (repo + admin:repo_hook) to connect $name: " GITHUB_TOKEN; echo; fi
    id=$(aws amplify create-app --name "$name" --repository "$REPO" --access-token "$GITHUB_TOKEN" --platform WEB \
      --environment-variables "SITE=$site,$urlvar=https://$site.$DOMAIN,PUBLIC_MAIN_URL=https://$DOMAIN" \
      --query app.appId --output text)
    aws amplify create-branch --app-id "$id" --branch-name "$BRANCH" --stage PRODUCTION --enable-auto-build >/dev/null
    info "Created $name: $id"
  else
    env_merge "$id" "SITE=$site" "$urlvar=https://$site.$DOMAIN" "PUBLIC_MAIN_URL=https://$DOMAIN"
    info "$name exists: $id (settings updated)"
  fi
  printf -v "APP_$site" '%s' "$id"
}
APP_theseus=""; APP_panomachea=""
ensure_app homesite-theseus theseus THESEUS_URL
ensure_app homesite-panomachea panomachea PANOMACHEA_URL
env_merge "$MAIN" "SITE_URL=https://$DOMAIN" "PUBLIC_THESEUS_URL=https://theseus.$DOMAIN" "PUBLIC_PANOMACHEA_URL=https://panomachea.$DOMAIN"
info "Main site linked to the Theseus and Panomachea subdomains"

# www -> apex redirect on the main app (kept ahead of any existing rules)
rules=$(aws amplify get-app --app-id "$MAIN" --query 'app.customRules' --output json)
newrules=$(py 'import json,sys
d=sys.argv[2]; rules=json.loads(sys.argv[1]) or []
src="https://www."+d
rules=[r for r in rules if r.get("source")!=src]
print(json.dumps([{"source":src,"target":"https://"+d,"status":"301"}]+rules))' "$rules" "$DOMAIN")
aws amplify update-app --app-id "$MAIN" --custom-rules "$newrules" >/dev/null
info "www.$DOMAIN redirects to $DOMAIN"

# ---------------------------------------------------------------- 4. custom domains
say "4. Amplify custom domains"
associate() { # app-id domain-name prefix...
  local id=$1 d=$2; shift 2
  if aws amplify get-domain-association --app-id "$id" --domain-name "$d" >/dev/null 2>&1; then
    info "$d already attached ($(aws amplify get-domain-association --app-id "$id" --domain-name "$d" --query domainAssociation.domainStatus --output text))"; return
  fi
  local subs; subs=$(py 'import json,sys; b=sys.argv[1]; print(json.dumps([{"prefix":p,"branchName":b} for p in sys.argv[2:]]))' "$BRANCH" "$@")
  if aws amplify create-domain-association --app-id "$id" --domain-name "$d" --no-enable-auto-sub-domain --sub-domain-settings "$subs" >/dev/null; then
    info "Attached $d (Amplify creates the certificate and Route 53 records)"
  else
    warn "Could not attach $d automatically. In the Amplify console open that app > Hosting > Custom domains > Add domain."
  fi
}
associate "$MAIN" "$DOMAIN" "" "www"
associate "$APP_theseus" "theseus.$DOMAIN" ""
associate "$APP_panomachea" "panomachea.$DOMAIN" ""

# ---------------------------------------------------------------- 5. SES
say "5. Email sending (SES)"
if ! aws sesv2 get-email-identity --email-identity "$DOMAIN" >/dev/null 2>&1; then
  aws sesv2 create-email-identity --email-identity "$DOMAIN" >/dev/null; info "Domain identity created"
fi
for t in $(aws sesv2 get-email-identity --email-identity "$DOMAIN" --query 'DkimAttributes.Tokens' --output text); do
  upsert "$t._domainkey.$DOMAIN" CNAME 1800 "$t.dkim.amazonses.com"
done
info "DKIM records added to Route 53 ($DOMAIN verifies once the nameservers are live)"
if ! aws sesv2 get-email-identity --email-identity "$CONTACT_TO" >/dev/null 2>&1; then
  aws sesv2 create-email-identity --email-identity "$CONTACT_TO" >/dev/null
  info "Verification email sent to $CONTACT_TO; click the link in it"
else
  info "$CONTACT_TO verified: $(aws sesv2 get-email-identity --email-identity "$CONTACT_TO" --query VerifiedForSendingStatus --output text)"
fi
if [ "$(aws sesv2 get-account --query ProductionAccessEnabled --output text)" != "True" ]; then
  warn "SES is in its sandbox: it only emails verified addresses. That's enough for enquiries to $CONTACT_TO."
  warn "To lift it later: SES console > Account dashboard > Request production access."
fi

# ---------------------------------------------------------------- 6. API
say "6. Contact form / newsletter / news feed API"
command -v sam >/dev/null || die "SAM CLI not found (it is preinstalled in CloudShell)."
# On a re-run without a token, the token saved in the stack is kept (SAM reuses previous values).
SHOP_PARAM=()
if [ -z "${SHOPIFY_ADMIN_TOKEN:-}" ] && ! aws cloudformation describe-stacks --stack-name "$STACK" >/dev/null 2>&1; then
  read -rsp "   Shopify Admin API token (write_customers) for the newsletter, or Enter to skip: " SHOPIFY_ADMIN_TOKEN; echo
  SHOPIFY_ADMIN_TOKEN="${SHOPIFY_ADMIN_TOKEN:-not-set}"
fi
[ -n "${SHOPIFY_ADMIN_TOKEN:-}" ] && SHOP_PARAM=("ShopifyAdminToken=$SHOPIFY_ADMIN_TOKEN")
( cd "$ROOT/infra" && sam build --template template.yaml >/dev/null && \
  sam deploy --stack-name "$STACK" --resolve-s3 --capabilities CAPABILITY_IAM --no-confirm-changeset --no-fail-on-empty-changeset \
    --parameter-overrides "DeployHosting=false" "DomainName=$DOMAIN" "ContactTo=$CONTACT_TO" "ContactFrom=$CONTACT_FROM" "${SHOP_PARAM[@]}" )
API=$(aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
info "API: $API"

# ---------------------------------------------------------------- 7. connect + rebuild
say "7. Connect the API and rebuild the sites"
env_merge "$MAIN" "PUBLIC_API_URL=$API"
for id in "$MAIN" "$APP_theseus" "$APP_panomachea"; do
  aws amplify start-job --app-id "$id" --branch-name "$BRANCH" --job-type RELEASE >/dev/null && info "Rebuild started: $id"
done

say "Done. Check progress any time with:  bash scripts/aws-setup.sh status"
info "Remaining by hand: nameservers at the registrar (above), and the SES verification email to $CONTACT_TO."
