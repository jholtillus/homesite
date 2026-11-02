// Headless cart. Lines are kept in localStorage; on checkout the cart is created in Shopify
// and the browser is sent to Shopify's hosted checkout on carthageworkshop.com.
//  - With a Storefront API token: cartCreate mutation -> cart.checkoutUrl
//  - Without a token: Shopify cart permalink  https://<domain>/cart/<variant>:<qty>,...

export type Line = { variantId: string; qty: number; title: string; variantTitle: string; price: string; currency: string; image: string; handle: string };

const KEY = 'jh-cart-v1';
const domain = import.meta.env.PUBLIC_SHOPIFY_DOMAIN || 'carthageworkshop.com';
const token = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

function read(): Line[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function write(lines: Line[]) {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  document.dispatchEvent(new CustomEvent('cart:change', { detail: lines }));
}

export const cart = {
  lines: read,
  count: () => read().reduce((n, l) => n + l.qty, 0),
  subtotal: () => read().reduce((n, l) => n + Number(l.price) * l.qty, 0),
  add(line: Omit<Line, 'qty'>, qty = 1) {
    const lines = read();
    const hit = lines.find((l) => l.variantId === line.variantId);
    if (hit) hit.qty += qty; else lines.push({ ...line, qty });
    write(lines);
  },
  setQty(variantId: string, qty: number) {
    write(read().map((l) => (l.variantId === variantId ? { ...l, qty } : l)).filter((l) => l.qty > 0));
  },
  remove(variantId: string) { write(read().filter((l) => l.variantId !== variantId)); },
  clear() { write([]); },

  async checkout() {
    const lines = read();
    if (!lines.length) return;
    if (token) {
      const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
        body: JSON.stringify({
          query: `mutation($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{checkoutUrl} userErrors{message}}}`,
          variables: { lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.qty })) },
        }),
      });
      const json = await res.json();
      const url = json?.data?.cartCreate?.cart?.checkoutUrl;
      if (url) { window.location.href = url; return; }
      console.warn('cartCreate failed, falling back to permalink', json);
    }
    const permalink = lines.map((l) => `${l.variantId.split('/').pop()}:${l.qty}`).join(',');
    window.location.href = `https://${domain}/cart/${permalink}`;
  },
};

export const money = (n: number | string, c = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(Number(n));
