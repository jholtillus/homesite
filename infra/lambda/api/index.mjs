// Single HTTP API handler:
//   GET  /feeds     -> latest YouTube videos and Substack posts as JSON (cached 15 min)
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

// ---- Feeds (News page live refresh)
const YT_HANDLE = process.env.YOUTUBE_HANDLE || 'jholtillus';
const SUBSTACK = process.env.SUBSTACK_URL || 'https://jholtillus.substack.com';
let feedCache = { at: 0, body: null };
const pick = (s, re) => (s.match(re)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
const plain = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const get = async (u) => { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.text(); };
function sanitize(html) {
  const ok = /^(p|br|h2|h3|h4|em|strong|b|i|a|blockquote|ul|ol|li|img|figure|figcaption|hr)$/;
  return html.replace(/<(script|style|iframe|form|button|svg|noscript|object|embed)[\s\S]*?<\/\1>/gi, '').replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (m, tag, attrs) => {
    const t = tag.toLowerCase(); if (!ok.test(t)) return ''; if (m.startsWith('</')) return `</${t}>`;
    const keep = [...attrs.matchAll(/\b(href|src|alt)="([^"]*)"/gi)].filter(([, , v]) => !/^\s*javascript:/i.test(v)).map(([, k, v]) => ` ${k.toLowerCase()}="${v}"`).join('');
    return `<${t}${keep}${t === 'a' ? ' target="_blank" rel="noopener"' : ''}${t === 'img' ? ' loading="lazy"' : ''}>`;
  });
}
async function feeds() {
  if (feedCache.body && Date.now() - feedCache.at < 15 * 60 * 1000) return feedCache.body;
  const [videos, posts] = await Promise.all([
    (async () => {
      const id = process.env.YOUTUBE_CHANNEL_ID || pick(await get(`https://www.youtube.com/@${YT_HANDLE}`), /"channelId":"(UC[\w-]{22})"/);
      const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
      return xml.split('<entry>').slice(1, 13).map((e) => { const v = pick(e, /<yt:videoId>(.*?)<\/yt:videoId>/); return { id: v, title: decode(pick(e, /<title>(.*?)<\/title>/)), date: pick(e, /<published>(.*?)<\/published>/).slice(0, 10), href: `https://www.youtube.com/watch?v=${v}`, thumb: `https://i.ytimg.com/vi/${v}/hqdefault.jpg` }; });
    })().catch((e) => (console.error(e), [])),
    (async () => {
      const xml = await get(`${SUBSTACK}/feed`);
      return xml.split('<item>').slice(1, 13).map((e) => ({ title: plain(pick(e, /<title>([\s\S]*?)<\/title>/)), date: new Date(pick(e, /<pubDate>(.*?)<\/pubDate>/)).toISOString().slice(0, 10), href: pick(e, /<link>(.*?)<\/link>/), excerpt: plain(pick(e, /<description>([\s\S]*?)<\/description>/)).slice(0, 220), html: sanitize(pick(e, /<content:encoded>([\s\S]*?)<\/content:encoded>/)), image: pick(e, /<enclosure[^>]+url="([^"]+)"/) || undefined }));
    })().catch((e) => (console.error(e), [])),
  ]);
  feedCache = { at: Date.now(), body: { videos, posts } };
  return feedCache.body;
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === 'GET' && event.rawPath.endsWith('/feeds')) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' }, body: JSON.stringify(await feeds()) };
  }
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
      const text = [`Name: ${name}`, `Email: ${email}`, `Type: ${clip(body.type, 100)}`, '', message].join('\n');
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
