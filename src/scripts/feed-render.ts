// Card markup for the News page, shared by the build-time render and the live refresh.
import type { Video, Post, Tweet } from '../data/feeds';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const fmtDate = (d: string) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
const tag = (sample?: boolean) => (sample ? '<span class="sample">Sample</span>' : '');

export const videoCard = (v: Video) => `
<article class="fi yt">
  <button class="play" ${v.id ? `data-yt="${esc(v.id)}"` : 'disabled'} aria-label="Play ${esc(v.title)}">
    <img src="${esc(v.thumb)}" alt="" loading="lazy"><span class="pb" aria-hidden="true"></span>
  </button>
  <div class="m">${tag(v.sample)}<time>${fmtDate(v.date)}</time><h3>${esc(v.title)}</h3>
  <a href="${esc(v.href)}" target="_blank" rel="noopener" class="out">Watch on YouTube ↗</a></div>
</article>`;

export const postCard = (p: Post) => `
<article class="fi ss">
  ${p.image ? `<img class="cover" src="${esc(p.image)}" alt="" loading="lazy">` : ''}
  <div class="m">${tag(p.sample)}<time>${fmtDate(p.date)}</time><h3>${esc(p.title)}</h3><p class="ex">${esc(p.excerpt)}</p>
  <details><summary><span class="more">Read here</span><span class="less">Close</span></summary><div class="post">${p.html}</div></details>
  <a href="${esc(p.href)}" target="_blank" rel="noopener" class="out">Open on Substack ↗</a></div>
</article>`;

export const tweetCard = (t: Tweet, handle: string) => `
<article class="fi tw">
  <div class="who"><span class="av">JH</span><span><b>Jordan Holt</b><br><span class="h">@${esc(handle)}</span></span>${tag(t.sample)}</div>
  <p>${esc(t.text)}</p>
  <div class="tm"><time>${fmtDate(t.date)}</time><a href="${esc(t.href)}" target="_blank" rel="noopener" class="out">View on X ↗</a></div>
</article>`;
