// Content for the Panomachea site. All prose is taken verbatim from the Panomachea Kickstarter
// campaign, panomachea.com and the Shopify product descriptions: sentences may be rearranged
// or left out, not added.
import products from '../../../src/data/products.json';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const MAIN_URL = (import.meta.env.PUBLIC_MAIN_URL || 'https://jordanholt.art').replace(/\/$/, '');
export const shopUrl = (handle: string) => `${MAIN_URL}/shop/${handle}/`;

type P = { handle: string; title: string; price: string; description: string; variants: { title: string; price: string }[]; available: boolean };
const all = products as P[];
export const product = (handle: string) => all.find((p) => p.handle === handle);
export const money = (n: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n));
export const firstPara = (handle: string) => product(handle)?.description.split('\n').filter(Boolean)[0] ?? '';

export const links = {
  rules: 'https://playpanomachea.com',
  substack: 'https://jholtillus.substack.com/',
  x: 'https://x.com/jholtillus',
  youtube: 'https://youtube.com/@jholtillus',
  instagram: 'https://instagram.com/jholtillus',
};

// ---------------------------------------------------------------- Cards
// Card scans live in panomachea/public/images/cards/, named SUIT_NN_NAME.jpg (lower case).
const files = readdirSync(join(process.cwd(), 'panomachea/public/images/cards')).filter((f) => f.endsWith('.jpg')).sort();
const title = (f: string) => f.replace(/\.jpg$/, '').split('_').slice(f.startsWith('tyc') || f.startsWith('wld') ? 1 : 2).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const card = (f: string, w: number, h: number) => ({ src: `/images/cards/${f}`, alt: title(f), w, h });

// Suit order and names as given on panomachea.com: "the Sky, Sea, Earth and Fire."
export const suits = [
  { key: 'sky', name: 'Sky', prefix: 'sky_' },
  { key: 'sea', name: 'Sea', prefix: 'sea_' },
  { key: 'earth', name: 'Earth', prefix: 'eth_' },
  { key: 'fire', name: 'Fire', prefix: 'fir_' },
].map((s) => ({ ...s, cards: files.filter((f) => f.startsWith(s.prefix)).map((f) => card(f, 600, 840)) }));

export const worldCards = files.filter((f) => f.startsWith('wld_') && !f.includes('back')).map((f) => card(f, 818, 600));
export const tycheCards = files.filter((f) => f.startsWith('tyc_') && !f.includes('back')).map((f) => card(f, 818, 600));
export const cardBack = card('fgt_back.jpg', 600, 840);
