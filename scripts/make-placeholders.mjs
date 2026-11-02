// Generates neutral, labelled SVG placeholders so the layout can be judged before real imagery
// is pulled in. Real images (jpg/png/webp) with the same base name take precedence once added
// and paths in src/data/site.ts are updated (pull-images.mjs does this mapping for you).
import { writeFileSync, mkdirSync } from 'node:fs';

const palettes = [
  ['#e9e4dc', '#c9bfae', '#8a7d68', '#2b2723'],
  ['#e4e6e3', '#b9c0b8', '#6f7a70', '#232624'],
  ['#ece6e1', '#d3bfb2', '#9a6e57', '#2a211c'],
  ['#e3e5ea', '#b7bccb', '#646c86', '#1f2230'],
  ['#efe9dd', '#d8c69f', '#a3824a', '#2b2418'],
];
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function svg(name, w, h, label, seed) {
  const r = rnd(seed * 7919 + 13);
  const [bg, mid, accent, ink] = palettes[seed % palettes.length];
  const shapes = [];
  const cx = w * (0.35 + r() * 0.3), cy = h * (0.35 + r() * 0.3), R = Math.min(w, h) * (0.22 + r() * 0.12);
  shapes.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${mid}"/>`);
  shapes.push(`<rect x="${w * 0.08}" y="${h * (0.62 + r() * 0.1)}" width="${w * 0.84}" height="${h * 0.02}" fill="${accent}"/>`);
  for (let i = 0; i < 3; i++) {
    const x = w * (0.1 + r() * 0.7), y = h * (0.1 + r() * 0.7), s = Math.min(w, h) * (0.06 + r() * 0.1);
    shapes.push(`<path d="M${x} ${y + s}L${x + s / 2} ${y}L${x + s} ${y + s}Z" fill="${ink}" opacity="${0.08 + r() * 0.12}"/>`);
  }
  // meander band (Greek key) along the bottom
  let key = '';
  const u = Math.max(8, Math.round(w / 60)), by = h - u * 4;
  for (let x = u; x < w - u * 4; x += u * 4) key += `M${x} ${by + u * 2}v${-u * 2}h${u * 3}v${u * 2}h${-u * 2}v${-u}h${u}`;
  shapes.push(`<path d="${key}" fill="none" stroke="${ink}" stroke-opacity=".25" stroke-width="${u / 4}"/>`);
  const fs = Math.max(14, Math.round(w / 34));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
<rect width="${w}" height="${h}" fill="${bg}"/>${shapes.join('')}
<text x="${w * 0.08}" y="${h * 0.1}" font-family="Georgia,serif" font-size="${fs * 1.6}" fill="${ink}" opacity=".85">${label}</text>
<text x="${w * 0.08}" y="${h * 0.1 + fs * 1.8}" font-family="Helvetica,Arial,sans-serif" font-size="${fs * 0.7}" letter-spacing="${fs * 0.15}" fill="${ink}" opacity=".5">PLACEHOLDER</text>
</svg>`;
}

const out = (dir, file, w, h, label, seed) => { mkdirSync(`public/images/${dir}`, { recursive: true }); writeFileSync(`public/images/${dir}/${file}.svg`, svg(file, w, h, label, seed)); };

const work = [
  ['Theseus I', 1200, 1600], ['The Labyrinth', 1200, 900], ['Panomachea', 1200, 1500], ['Portrait Study', 1200, 1200],
  ['Editorial', 1200, 1600], ['Ariadne', 1200, 900], ['Theseus II', 1200, 1600], ['Attic Coast', 1200, 800], ['Book Cover', 1200, 1800],
];
work.forEach(([l, w, h], i) => out('work', `work-${String(i + 1).padStart(2, '0')}`, w, h, l, i + 1));
out('projects', 'theseus-hero', 2400, 1200, 'Theseus', 11);
out('projects', 'panomachea-hero', 2400, 1200, 'Panomachea', 12);
for (let i = 1; i <= 4; i++) { out('projects', `theseus-0${i}`, 1200, 1500, `Theseus · page ${i}`, 20 + i); out('projects', `panomachea-0${i}`, 1200, 1500, `Panomachea · ${i}`, 30 + i); }
out('products', 'book-1', 1200, 1600, 'Theseus Vol. 1', 41); out('products', 'book-2', 1200, 1600, 'Theseus Vol. 2', 42);
out('products', 'print-1', 1200, 1500, 'Labyrinth Print', 43); out('products', 'print-2', 1200, 1500, 'Ariadne Print', 44);
out('products', 'print-3', 1200, 1500, 'Panomachea Print', 45); out('products', 'original-1', 1200, 1600, 'Original Page 12', 46);
out('products', 'original-2', 1200, 1500, 'Portrait Original', 47);
out('', 'portrait', 1200, 1500, 'Jordan Holt', 50);
out('', 'og', 1200, 630, 'Jordan Holt', 51);
console.log('placeholders written');
