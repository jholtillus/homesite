// Content for the Theseus site. All prose is taken verbatim from the three Kickstarter
// campaigns (Volume 1, Volume 2, the Final Volume): sentences may be rearranged or left out, not added.
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
  substack: 'https://jholtillus.substack.com/',
  x: 'https://x.com/jholtillus',
  youtube: 'https://youtube.com/@jholtillus',
  instagram: 'https://instagram.com/jholtillus',
};

// Volume text is taken verbatim from the Kickstarter campaigns.
export const volumes = [
  {
    title: 'Volume 1', pages: 148, cover: '/images/cover-vol1.jpg', coverW: 1096, coverH: 1600,
    hook: 'A satirical retelling of Theseus’ first four adventures along his path to Athens.',
    text: 'After learning that his father is king of Athens, Theseus sets out on foot to meet him, encountering bandits and beasts across the landscape of Ancient Greece.',
    extras: 'Volume 1 is a hardcover with a total of 148 pages. 129 full color comic pages, 4 pages of Letters from Readers (which aren’t real), a tutorial for drawing comic pages (which is thoroughly unhelpful) and behind the scenes and unpublished artwork from development (which is legitimate).',
  },
  {
    title: 'Volume 2', pages: 168, cover: '/images/art-vol2.jpg', coverW: 1035, coverH: 1600,
    hook: 'Theseus: Volume 2 covers four of Theseus’ adventures from his storied tale.',
    text: 'The story immediately follows Volume 1 with Theseus accosting bandits, arriving in Athens, and dealing with a homecoming that much more complicated than he expected.',
    extras: 'Theseus, Vol. 2 has 168 pages of full color comic goodness.',
  },
  {
    title: 'Volume 3', pages: 168, cover: '/images/cover-vol3.jpg', coverW: 1600, coverH: 1600,
    hook: 'Volume 3 picks up when the ships with black sails appear on the horizon in Athens’ port, and the people know that Minos has come to collect his tribute: fourteen tributes who will be fed to the monstrous Minotaur.',
    text: 'This 168 page hardcover contains four episodic chapters, knit together by Theseus’ journey to Crete, meeting the Princess Ariadne, and his ultimate confrontation with the most famous and menacing beast from Ancient Greek lore.',
    extras: '',
  },
];

export const samples = [
  { src: '/images/sample-1.jpg', w: 701, h: 1050, alt: 'Theseus Vol. 3' },
  { src: '/images/sample-3.jpg', w: 1096, h: 1600, alt: 'Theseus' },
  { src: '/images/sample-2.jpg', w: 679, h: 1050, alt: 'Theseus Vol. 3' },
  { src: '/images/sample-5.jpg', w: 1096, h: 1600, alt: 'Theseus' },
  { src: '/images/sample-4.jpg', w: 1096, h: 1600, alt: 'Theseus' },
  { src: '/images/sample-6.jpg', w: 1096, h: 1600, alt: 'Theseus' },
];

// ---------------------------------------------------------------- Reader
// Pages read online. To add pages: put the scans in theseus/public/read/vol1/ named
// 001.jpg, 002.jpg … and set EXT to 'jpg' and COUNT to the number of pages.
const EXT = 'jpg';
const COUNT = 59;
export const chapters = [
  { title: 'Chapter 1', volume: 'Volume 1', from: 1, to: COUNT },
];
export const readerPages = Array.from({ length: COUNT }, (_, i) => {
  const n = i + 1;
  return { n, src: `/read/vol1/${String(n).padStart(3, '0')}.${EXT}`, w: 800, h: 1168, chapter: chapters.find((c) => n >= c.from && n <= c.to)!.title };
});
