// Build-time product loader. Uses the Shopify Storefront API when a token is configured;
// otherwise falls back to the placeholder catalogue in site.ts.
import { fallbackProducts as placeholderProducts, type Product } from './site';

// products.json is written by `npm run pull-images` from carthageworkshop.com/products.json.
const pulled = Object.values(import.meta.glob<{ default: Product[] }>('./products.json', { eager: true }))[0]?.default;
const fallbackProducts: Product[] = pulled?.length ? pulled : placeholderProducts;

const domain = import.meta.env.PUBLIC_SHOPIFY_DOMAIN;
const token = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = '2025-01';

const QUERY = `#graphql
query Products($cursor: String) {
  products(first: 100, after: $cursor, sortKey: CREATED_AT, reverse: true) {
    pageInfo { hasNextPage endCursor }
    nodes {
      handle title description productType tags availableForSale
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { nodes { url } }
      variants(first: 50) { nodes { id title availableForSale price { amount } } }
    }
  }
}`;

function mapType(t: string, tags: string[], title: string): Product['type'] {
  const s = `${t} ${tags.join(' ')} ${title}`.toLowerCase();
  if (s.includes('digital')) return 'Digital';
  if (s.includes('original')) return 'Original';
  if (s.includes('print')) return 'Print';
  if (/deck|card game|panomachea/.test(s)) return 'Game';
  if (/book|comic|volume|vol\.|collection|hardcover|novel/.test(s)) return 'Book';
  return 'Print';
}

let cache: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (cache) return cache;
  if (!domain || !token) return (cache = fallbackProducts);
  try {
    const out: Product[] = [];
    let cursor: string | null = null;
    do {
      const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
        body: JSON.stringify({ query: QUERY, variables: { cursor } }),
      });
      const json: any = await res.json();
      const p = json.data.products;
      for (const n of p.nodes) {
        const tags = [...n.tags.map((t: string) => t.toLowerCase()), ...['theseus', 'panomachea', 'petracor'].filter((k) => `${n.title} ${n.description}`.toLowerCase().includes(k))];
        out.push({
          handle: n.handle,
          title: n.title,
          type: mapType(n.productType, tags, n.title),
          price: n.priceRange.minVariantPrice.amount,
          currency: n.priceRange.minVariantPrice.currencyCode,
          image: n.images.nodes[0]?.url ?? '',
          images: n.images.nodes.map((i: any) => i.url),
          description: n.description,
          tags,
          available: n.availableForSale,
          variants: n.variants.nodes.map((v: any) => ({ id: v.id, title: v.title, price: v.price.amount, available: v.availableForSale })),
        });
      }
      cursor = p.pageInfo.hasNextPage ? p.pageInfo.endCursor : null;
    } while (cursor);
    return (cache = out);
  } catch (e) {
    console.warn('[shopify] Storefront fetch failed, using fallback catalogue:', e);
    return (cache = fallbackProducts);
  }
}

export function formatPrice(amount: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));
}
