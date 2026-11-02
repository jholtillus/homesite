// Single HTTP API handler:
//   POST /contact   -> emails the enquiry to CONTACT_TO via Amazon SES (reply-to = sender)
//   POST /subscribe -> adds the email to Shopify customers with email-marketing consent,
//                      so launch announcements can be sent with Shopify Email.
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses = new SESv2Client({});
const { CONTACT_TO, CONTACT_FROM, SHOPIFY_ADMIN_DOMAIN, SHOPIFY_ADMIN_TOKEN } = process.env;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const res = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const clip = (s, n) => String(s ?? '').slice(0, n);

async function shopify(query, variables) {
  const r = await fetch(`https://${SHOPIFY_ADMIN_DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

async function subscribe(email) {
  const consent = { marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN' };
  const created = await shopify(
    `mutation($input: CustomerInput!) { customerCreate(input: $input) { customer { id } userErrors { field message } } }`,
    { input: { email, emailMarketingConsent: consent, tags: ['website-signup'] } },
  );
  const errs = created?.data?.customerCreate?.userErrors ?? [];
  if (!errs.length) return;
  // Existing customer: update consent instead.
  const found = await shopify(`query($q: String!) { customers(first: 1, query: $q) { nodes { id } } }`, { q: `email:${email}` });
  const id = found?.data?.customers?.nodes?.[0]?.id;
  if (!id) throw new Error('Shopify: ' + JSON.stringify(errs));
  await shopify(
    `mutation($input: CustomerEmailMarketingConsentUpdateInput!) { customerEmailMarketingConsentUpdate(input: $input) { userErrors { message } } }`,
    { input: { customerId: id, emailMarketingConsent: consent } },
  );
}

export const handler = async (event) => {
  let body;
  try { body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body || '{}'); }
  catch { return res(400, { error: 'Invalid JSON' }); }
  if (body.company) return res(200, { ok: true }); // honeypot
  const email = clip(body.email, 254).trim();
  if (!EMAIL.test(email)) return res(400, { error: 'Invalid email' });

  try {
    if (event.rawPath.endsWith('/subscribe')) {
      await subscribe(email);
      return res(200, { ok: true });
    }
    if (event.rawPath.endsWith('/contact')) {
      const name = clip(body.name, 200), message = clip(body.message, 10000);
      if (!name || !message) return res(400, { error: 'Missing fields' });
      const text = [`Name: ${name}`, `Email: ${email}`, `Type: ${clip(body.type, 100)}`, `Budget: ${clip(body.budget, 200)}`, `Deadline: ${clip(body.deadline, 200)}`, '', message].join('\n');
      await ses.send(new SendEmailCommand({
        FromEmailAddress: CONTACT_FROM,
        Destination: { ToAddresses: [CONTACT_TO] },
        ReplyToAddresses: [email],
        Content: { Simple: { Subject: { Data: `[Website] ${clip(body.type, 60) || 'Enquiry'} — ${name}` }, Body: { Text: { Data: text } } } },
      }));
      if (body.subscribe) await subscribe(email).catch((e) => console.error('subscribe failed', e));
      return res(200, { ok: true });
    }
    return res(404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    return res(500, { error: 'Server error' });
  }
};
