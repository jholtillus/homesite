// Build-time feeds (public RSS, no API keys). Rebuild to refresh — see README for a scheduled rebuild.
import { site, studioNews, type NewsItem } from './site';

const pick = (s: string, re: RegExp) => (s.match(re)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
const text = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

async function get(url: string) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

async function channelId() {
  if (site.youtubeChannelId) return site.youtubeChannelId;
  try { return pick(await get(`https://www.youtube.com/@${site.youtubeHandle}`), /"channelId":"(UC[\w-]{22})"/); } catch { return ''; }
}

let yt: NewsItem[] | null = null;
export async function getYouTube(limit = 6): Promise<NewsItem[]> {
  if (yt) return yt.slice(0, limit);
  try {
    const id = await channelId();
    if (!id) return (yt = []);
    const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    yt = xml.split('<entry>').slice(1).map((e) => {
      const v = pick(e, /<yt:videoId>(.*?)<\/yt:videoId>/);
      return { date: pick(e, /<published>(.*?)<\/published>/).slice(0, 10), title: pick(e, /<title>(.*?)<\/title>/), summary: text(pick(e, /<media:description>([\s\S]*?)<\/media:description>/)).slice(0, 180), href: `https://www.youtube.com/watch?v=${v}`, source: 'YouTube' as const, image: `https://i.ytimg.com/vi/${v}/hqdefault.jpg` };
    });
  } catch (e) { console.warn('[feeds] YouTube unavailable:', (e as Error).message); yt = []; }
  return yt.slice(0, limit);
}

let ss: NewsItem[] | null = null;
export async function getSubstack(limit = 6): Promise<NewsItem[]> {
  if (ss) return ss.slice(0, limit);
  try {
    const xml = await get('https://jholtillus.substack.com/feed');
    ss = xml.split('<item>').slice(1).map((e) => ({
      date: new Date(pick(e, /<pubDate>(.*?)<\/pubDate>/)).toISOString().slice(0, 10),
      title: text(pick(e, /<title>([\s\S]*?)<\/title>/)),
      summary: text(pick(e, /<description>([\s\S]*?)<\/description>/)).slice(0, 180),
      href: pick(e, /<link>(.*?)<\/link>/),
      source: 'Substack' as const,
      image: pick(e, /<enclosure[^>]+url="([^"]+)"/) || undefined,
    }));
  } catch (e) { console.warn('[feeds] Substack unavailable:', (e as Error).message); ss = []; }
  return ss.slice(0, limit);
}

export async function getNews(limit = 20): Promise<NewsItem[]> {
  const dated = [...(await getYouTube(10)), ...(await getSubstack(10))].sort((a, b) => b.date!.localeCompare(a.date!));
  return [...studioNews, ...dated].slice(0, limit);
}
