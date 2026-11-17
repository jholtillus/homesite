// Content for the Theseus site. Text is edited from the three Kickstarter campaigns
// (Volume 1, 2021; Volume 2, 2022; the Final Volume, 2026).
import products from '../../../src/data/products.json';

export const MAIN_URL = (import.meta.env.PUBLIC_MAIN_URL || 'https://jordanholt.art').replace(/\/$/, '');
export const shopUrl = (handle: string) => `${MAIN_URL}/shop/${handle}/`;

type P = { handle: string; title: string; price: string; variants: { title: string; price: string }[]; available: boolean };
const all = products as P[];
export const product = (handle: string) => all.find((p) => p.handle === handle);
export const money = (n: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n));
export const priceRange = (handle: string) => {
  const p = product(handle); if (!p) return '';
  const ps = [...new Set(p.variants.map((v) => Number(v.price)))].sort((a, b) => a - b);
  return ps.length > 1 ? `${money(ps[0])}–${money(ps[ps.length - 1])}` : money(ps[0]);
};

export const links = {
  webtoon: 'https://www.webtoons.com/en/canvas/theseus/list?title_no=656447',
  substack: 'https://jholtillus.substack.com/',
  x: 'https://x.com/jholtillus',
  youtube: 'https://youtube.com/@jholtillus',
  instagram: 'https://instagram.com/jholtillus',
};

export const volumes = [
  {
    n: 'I', title: 'Volume One', pages: 148, cover: '/images/cover-vol1.jpg', coverW: 1096, coverH: 1600,
    hook: 'The road to Athens.',
    text: 'After learning that his father is the king of Athens, Theseus sets out on foot to meet him, running into bandits and beasts across the landscape of Ancient Greece. His first four adventures on the road.',
    extras: '129 full-color comic pages, plus Letters from Readers (which aren’t real), a tutorial for drawing comic pages (which is thoroughly unhelpful) and behind-the-scenes artwork from development (which is legitimate).',
    handle: 'theseus-vol-1-hardcover-light-cover-damage', buyNote: 'Volume One is sold as part of the full collection; a few copies with light cover damage are available on their own.',
  },
  {
    n: 'II', title: 'Volume Two', pages: 172, cover: '/images/art-vol2.jpg', coverW: 1600, coverH: 1600,
    hook: 'A complicated homecoming.',
    text: 'Picking up right where Volume One ends: Theseus accosts more bandits, arrives in Athens, and deals with a homecoming far more complicated than he expected. With his own legend outgrowing him, he’s forced to reckon with the man he aspires to be.',
    extras: '172 pages of full-color comic, four more adventures from his storied tale.',
    handle: 'theseus-vol-2-digital', buyNote: 'In print as part of the full collection, or as a digital copy.',
  },
  {
    n: 'III', title: 'Volume Three', pages: 168, cover: '/images/cover-vol3.jpg', coverW: 1600, coverH: 1600,
    hook: 'Black sails on the horizon.',
    text: 'Ships with black sails appear in Athens’ port, and the people know Minos has come to collect his tribute: fourteen young Athenians to be fed to the Minotaur. Four chapters, knit together by Theseus’ journey to Crete, his meeting with the Princess Ariadne, and his confrontation with the most famous and menacing beast of Greek lore.',
    extras: '168-page hardcover. The series conclusion. Rated 12+.',
    handle: 'theseus-vol-3-hardcover', buyNote: '',
  },
];

export const samples = [
  { src: '/images/sample-1.jpg', w: 701, h: 1050, alt: 'Page from Volume Three' },
  { src: '/images/sample-3.jpg', w: 1096, h: 1600, alt: 'Page from Theseus' },
  { src: '/images/sample-2.jpg', w: 679, h: 1050, alt: 'Page from Volume Three' },
  { src: '/images/sample-5.jpg', w: 1096, h: 1600, alt: 'Page from Theseus' },
  { src: '/images/sample-4.jpg', w: 1096, h: 1600, alt: 'Page from Theseus' },
  { src: '/images/sample-6.jpg', w: 1096, h: 1600, alt: 'Page from Theseus' },
];

// ---------------------------------------------------------------- Reader
// Pages read online. To add pages: put the scans in theseus/public/read/vol1/ named
// 001.jpg, 002.jpg … and set EXT to 'jpg' and COUNT to the number of pages.
const EXT = 'svg';   // 'svg' = placeholders; switch to 'jpg' when the real scans are in
const COUNT = 10;
export const chapters = [
  { title: 'Chapter One', volume: 'Volume One', from: 1, to: COUNT },
];
export const readerPages = Array.from({ length: COUNT }, (_, i) => {
  const n = i + 1;
  return { n, src: `/read/vol1/${String(n).padStart(3, '0')}.${EXT}`, w: 1100, h: 1600, chapter: chapters.find((c) => n >= c.from && n <= c.to)!.title };
});
