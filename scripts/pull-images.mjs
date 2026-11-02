// Pulls real imagery and catalogue data from the existing sites. Run where those hosts are reachable:
//   NODE_USE_ENV_PROXY=1 npm run pull-images   (the env var is only needed behind a proxy)
// 1. carthageworkshop.com/products.json (public Shopify endpoint) -> src/data/products.json
//    (used automatically as the catalogue when no Storefront token is set; real variant IDs,
//     so cart -> checkout works immediately via cart permalinks)
// 2. Images from jordanholt.art, theseuscomic.com, panomachea.com -> source-images/<site>/
//    plus source-images/manifest.json listing every file with its source URL and alt text,
//    for mapping into src/data/site.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

const SHOP = 'carthageworkshop.com';
const SITES = ['jordanholt.art', 'theseuscomic.com', 'panomachea.com'];
const UA = { 'User-Agent': 'Mozilla/5.0 (site-migration)' };

async function download(url, file) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}
const largest = (srcset) => srcset.split(',').map((s) => s.trim().split(/\s+/)).sort((a, b) => parseInt(b[1] || 0) - parseInt(a[1] || 0))[0]?.[0];

// 1. Shopify catalogue (images are saved locally so the site has no runtime dependency on the store)
const typeOf = (p) => {
  const s = `${p.product_type} ${p.tags.join(' ')} ${p.title}`.toLowerCase();
  if (s.includes('digital')) return 'Digital';
  if (s.includes('original')) return 'Original';
  if (s.includes('print')) return 'Print';
  if (/deck|card game|panomachea/.test(s)) return 'Game';
  if (/book|comic|volume|vol\.|collection|hardcover|novel/.test(s)) return 'Book';
  return 'Print';
};
const projectTags = (p) => ['theseus', 'panomachea', 'petracor'].filter((t) => `${p.title} ${p.body_html}`.toLowerCase().includes(t));
try {
  const all = [];
  for (let page = 1; page < 20; page++) {
    const { products } = await (await fetch(`https://${SHOP}/products.json?limit=250&page=${page}`, { headers: UA })).json();
    if (!products.length) break;
    all.push(...products);
  }
  mkdirSync('public/images/products', { recursive: true });
  const strip = (h) => (h || '').replace(/<\/(p|li|div|h\d)>|<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  const out = [];
  for (const p of all) {
    const images = [];
    for (const [i, img] of p.images.entries()) {
      const path = new URL(img.src).pathname, file = path.slice(path.lastIndexOf('/files/') + 7);
      const local = `/images/products/${p.handle}-${i + 1}.jpg`;
      try { await download(`https://${SHOP}/cdn/shop/files/${file}?width=1600`, `public${local}`); images.push({ src: local, w: img.width, h: img.height }); }
      catch (e) { console.warn(' image skip', e.message); }
    }
    out.push({
      handle: p.handle, title: p.title.replace(/\s+/g, ' ').trim(), type: typeOf(p),
      price: p.variants[0]?.price ?? '0', currency: 'USD',
      image: images[0]?.src ?? '', images: images.map((i) => i.src),
      description: strip(p.body_html), tags: [...new Set([...p.tags.map((t) => t.toLowerCase()), ...projectTags(p)])],
      available: p.variants.some((v) => v.available),
      variants: p.variants.map((v) => ({ id: `gid://shopify/ProductVariant/${v.id}`, title: v.title, price: v.price, available: v.available })),
    });
  }
  writeFileSync('src/data/products.json', JSON.stringify(out, null, 2));
  console.log(`shop: ${out.length} products -> src/data/products.json`);
} catch (e) { console.warn('shop: failed —', e.message); }

// 2. Site imagery
const manifest = [];
for (const site of SITES) {
  const dir = `source-images/${site}`; mkdirSync(dir, { recursive: true });
  try {
    const html = await (await fetch(`https://${site}/`, { headers: UA })).text();
    const urls = new Map();
    for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/gi)) urls.set(m[1], 'og:image');
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0], attr = (n) => tag.match(new RegExp(`\\b${n}=["']([^"']+)`, 'i'))?.[1];
      const src = (attr('srcset') && largest(attr('srcset'))) || attr('data-src') || attr('src');
      if (src && !src.startsWith('data:')) urls.set(src, attr('alt') || '');
    }
    let i = 0;
    for (const [raw, alt] of urls) {
      const url = new URL(raw.replace(/&amp;/g, '&'), `https://${site}/`).href;
      const ext = (extname(new URL(url).pathname) || '.jpg').split('?')[0].slice(0, 5);
      const file = `${dir}/${String(++i).padStart(2, '0')}${ext}`;
      try { await download(url, file); manifest.push({ site, file: file, url, alt }); } catch (e) { console.warn(' skip', e.message); }
    }
    console.log(`${site}: ${i} images`);
  } catch (e) { console.warn(`${site}: failed —`, e.message); }
}
writeFileSync('source-images/manifest.json', JSON.stringify(manifest, null, 2));
console.log('manifest -> source-images/manifest.json');
