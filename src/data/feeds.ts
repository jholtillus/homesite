// Feeds for the News page. Fetched at build time from public RSS (no API keys). When
// PUBLIC_API_URL is set the page also refreshes them live from the /feeds Lambda.
// Preview builds (ARTIFACT=1) fill empty feeds with clearly labelled sample items.
import { site, studioNews, type NewsItem } from './site';

export type Video = { id: string; title: string; date: string; href: string; thumb: string; sample?: boolean };
export type Post = { title: string; date: string; href: string; excerpt: string; html: string; image?: string; sample?: boolean };
export type Tweet = { text: string; date: string; href: string; sample?: boolean };

const SAMPLES = !!process.env.ARTIFACT || process.env.SAMPLE_FEEDS === '1';
const pick = (s: string, re: RegExp) => (s.match(re)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
const text = (s: string) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function get(url: string) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

// Keeps a safe subset of the Substack post HTML so it can be read in place.
export function sanitize(html: string) {
  const ok = /^(p|br|h2|h3|h4|em|strong|b|i|a|blockquote|ul|ol|li|img|figure|figcaption|hr)$/;
  return html
    .replace(/<(script|style|iframe|form|button|svg|noscript|object|embed)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (m, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!ok.test(t)) return '';
      if (m.startsWith('</')) return `</${t}>`;
      const keep = [...attrs.matchAll(/\b(href|src|alt)="([^"]*)"/gi)]
        .filter(([, , v]) => !/^\s*javascript:/i.test(v))
        .map(([, k, v]) => ` ${k.toLowerCase()}="${v}"`).join('');
      return `<${t}${keep}${t === 'a' ? ' target="_blank" rel="noopener"' : ''}${t === 'img' ? ' loading="lazy"' : ''}>`;
    });
}

let yt: Video[] | null = null;
export async function getVideos(): Promise<Video[]> {
  if (yt) return yt;
  try {
    let id = site.youtubeChannelId;
    if (!id) id = pick(await get(`https://www.youtube.com/@${site.youtubeHandle}`), /"channelId":"(UC[\w-]{22})"/);
    if (!id) throw new Error('channel id not found');
    const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    yt = xml.split('<entry>').slice(1).map((e) => {
      const v = pick(e, /<yt:videoId>(.*?)<\/yt:videoId>/);
      return { id: v, title: decode(pick(e, /<title>(.*?)<\/title>/)), date: pick(e, /<published>(.*?)<\/published>/).slice(0, 10), href: `https://www.youtube.com/watch?v=${v}`, thumb: `https://i.ytimg.com/vi/${v}/hqdefault.jpg` };
    });
  } catch (e) { console.warn('[feeds] YouTube unavailable:', (e as Error).message); yt = []; }
  if (!yt.length && SAMPLES) yt = sampleVideos;
  return yt;
}

let ss: Post[] | null = null;
export async function getPosts(): Promise<Post[]> {
  if (ss) return ss;
  try {
    const xml = await get('https://jholtillus.substack.com/feed');
    ss = xml.split('<item>').slice(1).map((e) => {
      const body = pick(e, /<content:encoded>([\s\S]*?)<\/content:encoded>/);
      return {
        title: text(pick(e, /<title>([\s\S]*?)<\/title>/)),
        date: new Date(pick(e, /<pubDate>(.*?)<\/pubDate>/)).toISOString().slice(0, 10),
        href: pick(e, /<link>(.*?)<\/link>/),
        excerpt: text(pick(e, /<description>([\s\S]*?)<\/description>/)).slice(0, 220),
        html: sanitize(body),
        image: pick(e, /<enclosure[^>]+url="([^"]+)"/) || undefined,
      };
    });
  } catch (e) { console.warn('[feeds] Substack unavailable:', (e as Error).message); ss = []; }
  if (!ss.length && SAMPLES) ss = samplePosts;
  return ss;
}

// X has no free public feed; the page uses X's official timeline embed. Samples only fill the preview.
export const getTweets = async (): Promise<Tweet[]> => (SAMPLES ? sampleTweets : []);

export async function getNews(limit = 20): Promise<NewsItem[]> {
  const v = (await getVideos()).filter((x) => !x.sample).map((x) => ({ date: x.date, title: x.title, summary: '', href: x.href, source: 'YouTube' as const, image: x.thumb }));
  const p = (await getPosts()).filter((x) => !x.sample).map((x) => ({ date: x.date, title: x.title, summary: x.excerpt, href: x.href, source: 'Substack' as const, image: x.image }));
  return [...studioNews, ...[...v, ...p].sort((a, b) => b.date!.localeCompare(a.date!))].slice(0, limit);
}

// ---- Preview samples (never used in production builds)
const sampleVideos: Video[] = [
  { id: '', title: 'Sample video — Inking a Theseus page', date: '2026-10-28', href: 'https://youtube.com/@jholtillus', thumb: '/images/art/theseus-vol3-page-2.jpg', sample: true },
  { id: '', title: 'Sample video — Painting All Hallows’ in watercolor', date: '2026-10-14', href: 'https://youtube.com/@jholtillus', thumb: '/images/art/all-hallows.jpg', sample: true },
  { id: '', title: 'Sample video — Designing a Panomachea card', date: '2026-09-30', href: 'https://youtube.com/@jholtillus', thumb: '/images/art/panomachea-card-back.jpg', sample: true },
  { id: '', title: 'Sample video — PetraCor concept sketches', date: '2026-09-12', href: 'https://youtube.com/@jholtillus', thumb: '/images/art/petracor-concept-2.jpg', sample: true },
];
const samplePosts: Post[] = [
  { title: 'Sample post — Finishing Theseus', date: '2026-10-20', href: 'https://jholtillus.substack.com/', excerpt: 'Placeholder excerpt. A Substack post appears here with its opening lines, and can be read in full without leaving the page.', html: '<p>Placeholder post body. When the site is built with access to the Substack feed, the full text of each post appears here, including images.</p><p>Readers can finish the post here, or open it on Substack to comment and subscribe.</p>', image: '/images/products/theseus-the-full-collection-1.jpg', sample: true },
  { title: 'Sample post — Greek pottery and card design', date: '2026-09-18', href: 'https://jholtillus.substack.com/', excerpt: 'Placeholder excerpt about using Greek pottery to guide the Panomachea character designs.', html: '<p>Placeholder post body.</p>', image: '/images/projects/panomachea/card-anatomy.jpg', sample: true },
  { title: 'Sample post — Notes from the drawing table', date: '2026-08-30', href: 'https://jholtillus.substack.com/', excerpt: 'Placeholder excerpt for a studio diary entry.', html: '<p>Placeholder post body.</p>', sample: true },
];
const sampleTweets: Tweet[] = [
  { text: 'Sample post. Theseus Vol. 3 hardcovers are packed and shipping this week.', date: '2026-10-30', href: 'https://x.com/jholtillus', sample: true },
  { text: 'Sample post. Work in progress on a new PetraCor page — ink on watercolor paper.', date: '2026-10-22', href: 'https://x.com/jholtillus', sample: true },
  { text: 'Sample post. New process video is up on YouTube.', date: '2026-10-14', href: 'https://x.com/jholtillus', sample: true },
  { text: 'Sample post. Panomachea Deluxe restocked in the shop.', date: '2026-10-02', href: 'https://x.com/jholtillus', sample: true },
];
