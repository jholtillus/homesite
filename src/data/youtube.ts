// Build-time YouTube feed (public RSS, no API key). Rebuild the site to refresh,
// or let the scheduled rebuild in infra/ handle it.
import type { NewsItem } from './site';

export async function getYouTube(channelId: string, limit = 6): Promise<NewsItem[]> {
  if (!channelId) return [];
  try {
    const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)).text();
    const entries = xml.split('<entry>').slice(1, limit + 1);
    const pick = (s: string, re: RegExp) => (s.match(re)?.[1] ?? '').trim();
    return entries.map((e) => {
      const id = pick(e, /<yt:videoId>(.*?)<\/yt:videoId>/);
      return {
        date: pick(e, /<published>(.*?)<\/published>/).slice(0, 10),
        title: pick(e, /<title>(.*?)<\/title>/),
        summary: pick(e, /<media:description>([\s\S]*?)<\/media:description>/).slice(0, 160),
        href: `https://www.youtube.com/watch?v=${id}`,
        source: 'YouTube' as const,
        image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    });
  } catch {
    return [];
  }
}
