// Pulls real imagery and catalogue data from the existing sites. Run where those hosts are reachable:
//   npm run pull-images
// 1. carthageworkshop.com/products.json (public Shopify endpoint) -> src/data/products.json
//    (used automatically as the catalogue when no Storefront token is set; real variant IDs,
//     so cart -> checkout works immediately via cart permalinks)
// 2. Images from jordanholt.art, theseuscomic.com, panomachea.com -> public/images/source/<site>/
//    plus public/images/source/manifest.json listing every file with its source URL and alt text,
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

// 1. Shopify catalogue
try {
  const all = [];
  for (let page = 1; page < 20; page++) {
    const { products } = await (await fetch(`https://${SHOP}/products.json?limit=250&page=${page}`, { headers: UA })).json();
    if (!products.length) break;
    all.push(...products);
  }
  const mapType = (p) => { const s = `${p.product_type} ${p.tags.join(' ')} ${p.title}`.toLowerCase(); return s.includes('original') ? 'Original' : /book|comic|volume|novel/.test(s) ? 'Book' : 'Print'; };
  const strip = (h) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const out = all.map((p) => ({
    handle: p.handle, title: p.title, type: mapType(p),
    price: p.variants[0]?.price ?? '0', currency: 'USD',
    image: p.images[0]?.src ?? '/images/products/print-1.svg', images: p.images.map((i) => i.src),
    description: strip(p.body_html), tags: p.tags.map((t) => t.toLowerCase()),
    available: p.variants.some((v) => v.available),
    variants: p.variants.map((v) => ({ id: `gid://shopify/ProductVariant/${v.id}`, title: v.title, price: v.price, available: v.available })),
  }));
  writeFileSync('src/data/products.json', JSON.stringify(out, null, 2));
  console.log(`shop: ${out.length} products -> src/data/products.json`);
} catch (e) { console.warn('shop: failed —', e.message); }

// 2. Site imagery
const manifest = [];
for (const site of SITES) {
  const dir = `public/images/source/${site}`; mkdirSync(dir, { recursive: true });
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
      try { await download(url, file); manifest.push({ site, file: file.replace('public', ''), url, alt }); } catch (e) { console.warn(' skip', e.message); }
    }
    console.log(`${site}: ${i} images`);
  } catch (e) { console.warn(`${site}: failed —`, e.message); }
}
writeFileSync('public/images/source/manifest.json', JSON.stringify(manifest, null, 2));
console.log('manifest -> public/images/source/manifest.json');
