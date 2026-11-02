#!/usr/bin/env bash
# Build the site and publish it to the S3 bucket / CloudFront distribution from infra/template.yaml.
# Usage: STACK=jordanholt-site npm run deploy
set -euo pipefail
STACK="${STACK:-jordanholt-site}"
out() { aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
BUCKET=$(out BucketName); DIST=$(out DistributionId)
export PUBLIC_API_URL="${PUBLIC_API_URL:-$(out ApiUrl)}"
npm run build
# Fingerprinted build assets (_astro/) cache for a year; everything else revalidates hourly / HTML always.
aws s3 sync dist/_astro "s3://$BUCKET/_astro" --cache-control "public,max-age=31536000,immutable"
aws s3 sync dist/ "s3://$BUCKET" --delete --exclude "_astro/*" --exclude "*.html" --exclude "*.xml" --cache-control "public,max-age=3600"
aws s3 sync dist/ "s3://$BUCKET" --exclude "*" --include "*.html" --include "*.xml" --cache-control "public,max-age=0,must-revalidate"
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*" >/dev/null
echo "Deployed to $(out CloudFrontUrl)"
