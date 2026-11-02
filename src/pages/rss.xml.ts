import { site } from '../data/site';
import { getNews } from '../data/feeds';

export async function GET({ site: base }: { site: URL }) {
  const items = await getNews(30);
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title>${esc(site.name)} — News</title><link>${base}</link><description>${esc(site.tagline)}</description>
${items.map((i) => `<item><title>${esc(i.title)}</title><link>${new URL(i.href, base)}</link><guid>${new URL(i.href, base)}</guid>${i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ''}<description>${esc(i.summary)}</description></item>`).join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } });
}
