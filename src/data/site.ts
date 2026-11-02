// Central content file. Replace placeholder entries with real content as it becomes available.
// Images live in /public/images. Run `npm run pull-images` (with network access to the
// source sites) to replace the generated placeholders with real imagery.

export const site = {
  name: 'Jordan Holt',
  tagline: 'Illustration, comics & myth',
  email: 'studio@jordanholt.art', // PLACEHOLDER: replace with real contact address
  shopDomain: import.meta.env.PUBLIC_SHOPIFY_DOMAIN || 'carthageworkshop.com',
  apiUrl: import.meta.env.PUBLIC_API_URL || '',
  youtubeChannelId: import.meta.env.PUBLIC_YOUTUBE_CHANNEL_ID || '',
  twitterHandle: import.meta.env.PUBLIC_TWITTER_HANDLE || '',
};

export const nav = [
  { label: 'Work', href: '/work/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Shop', href: '/shop/' },
  { label: 'News', href: '/news/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const social = [
  { label: 'X / Twitter', href: site.twitterHandle ? `https://x.com/${site.twitterHandle}` : 'https://x.com/', key: 'x' },
  { label: 'YouTube', href: site.youtubeChannelId ? `https://www.youtube.com/channel/${site.youtubeChannelId}` : 'https://www.youtube.com/', key: 'youtube' },
  { label: 'Newsletter', href: 'https://jholtillus.substack.com/', key: 'substack' },
];

export type Artwork = {
  slug: string;
  title: string;
  year: string;
  medium: string;
  category: 'Illustration' | 'Comics' | 'Fine Art' | 'Commission';
  image: string;
  w: number;
  h: number;
  project?: string;
};

// PLACEHOLDER portfolio entries: titles/years/media are stand-ins.
export const artwork: Artwork[] = [
  { slug: 'theseus-cover', title: 'Theseus, Vol. 1 — Cover', year: '2021', medium: 'Ink & digital colour', category: 'Comics', image: '/images/work/work-01.svg', w: 1200, h: 1600, project: 'theseus' },
  { slug: 'minotaur', title: 'The Labyrinth', year: '2022', medium: 'Ink on bristol', category: 'Comics', image: '/images/work/work-02.svg', w: 1200, h: 900, project: 'theseus' },
  { slug: 'panomachea-key', title: 'Panomachea — Key Art', year: '2024', medium: 'Digital', category: 'Illustration', image: '/images/work/work-03.svg', w: 1200, h: 1500, project: 'panomachea' },
  { slug: 'portrait-study', title: 'Portrait Study', year: '2023', medium: 'Graphite', category: 'Fine Art', image: '/images/work/work-04.svg', w: 1200, h: 1200 },
  { slug: 'editorial-01', title: 'Editorial Illustration', year: '2023', medium: 'Gouache', category: 'Commission', image: '/images/work/work-05.svg', w: 1200, h: 1600 },
  { slug: 'ariadne', title: 'Ariadne', year: '2022', medium: 'Ink & watercolour', category: 'Illustration', image: '/images/work/work-06.svg', w: 1200, h: 900 },
  { slug: 'theseus-vol2', title: 'Theseus, Vol. 2 — Cover', year: '2023', medium: 'Ink & digital colour', category: 'Comics', image: '/images/work/work-07.svg', w: 1200, h: 1600, project: 'theseus' },
  { slug: 'landscape', title: 'Attic Coast', year: '2024', medium: 'Oil on panel', category: 'Fine Art', image: '/images/work/work-08.svg', w: 1200, h: 800 },
  { slug: 'book-cover', title: 'Book Cover Commission', year: '2024', medium: 'Digital', category: 'Commission', image: '/images/work/work-09.svg', w: 1200, h: 1800 },
];

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  body: string[];
  hero: string;
  gallery: string[];
  status: string;
  externalUrl?: string;
  productTags: string[]; // product handles/tags shown on the project page
  facts: { label: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: 'theseus',
    title: 'Theseus',
    kicker: 'Graphic novel',
    summary: 'A satirical retelling of the life of Theseus, drawn from the ancient writings of Plutarch — and cheerfully departing from them.',
    body: [
      'Theseus began as a web comic and grew into a multi-volume graphic novel. It follows the hero of Athens from his birth in Troezen through the labyrinth and beyond, playing the myth straight just long enough to undercut it.',
      'This page consolidates theseuscomic.com: the story so far, the printed volumes, original pages, and prints. PLACEHOLDER COPY — replace with final text.',
    ],
    hero: '/images/projects/theseus-hero.svg',
    gallery: ['/images/projects/theseus-01.svg', '/images/projects/theseus-02.svg', '/images/projects/theseus-03.svg', '/images/projects/theseus-04.svg'],
    status: 'Volumes 1–2 available',
    externalUrl: 'https://theseuscomic.com',
    productTags: ['theseus'],
    facts: [
      { label: 'Format', value: 'Graphic novel, 2 volumes' },
      { label: 'Publisher', value: 'Carthage Press' },
      { label: 'Years', value: '2021–2023' },
      { label: 'Source', value: 'Plutarch, Life of Theseus' },
    ],
  },
  {
    slug: 'panomachea',
    title: 'Panomachea',
    kicker: 'Project',
    summary: 'PLACEHOLDER — one-sentence summary of Panomachea.',
    body: [
      'PLACEHOLDER COPY — this page consolidates panomachea.com. Describe the project, its world, and where it stands.',
      'Add process imagery, release updates, and related products. Products tagged “panomachea” in Shopify appear below automatically.',
    ],
    hero: '/images/projects/panomachea-hero.svg',
    gallery: ['/images/projects/panomachea-01.svg', '/images/projects/panomachea-02.svg', '/images/projects/panomachea-03.svg', '/images/projects/panomachea-04.svg'],
    status: 'In development',
    externalUrl: 'https://panomachea.com',
    productTags: ['panomachea'],
    facts: [
      { label: 'Format', value: 'PLACEHOLDER' },
      { label: 'Status', value: 'In development' },
    ],
  },
];

export type Product = {
  handle: string;
  title: string;
  type: 'Original' | 'Print' | 'Book';
  price: string;
  currency: string;
  image: string;
  images: string[];
  description: string;
  tags: string[];
  available: boolean;
  variants: { id: string; title: string; price: string; available: boolean }[];
};

// Fallback catalogue used when no Storefront API token is configured at build time.
// PLACEHOLDER: variant IDs below are not real; checkout works once the live catalogue loads.
export const fallbackProducts: Product[] = [
  { handle: 'theseus-volume-1', title: 'Theseus, Volume 1', type: 'Book', price: '25.00', currency: 'USD', image: '/images/products/book-1.svg', images: ['/images/products/book-1.svg'], description: 'The first volume of Theseus. Softcover. PLACEHOLDER DESCRIPTION.', tags: ['theseus', 'book'], available: true, variants: [{ id: 'gid://shopify/ProductVariant/1', title: 'Default', price: '25.00', available: true }] },
  { handle: 'theseus-volume-2', title: 'Theseus, Volume 2', type: 'Book', price: '25.00', currency: 'USD', image: '/images/products/book-2.svg', images: ['/images/products/book-2.svg'], description: 'The second volume of Theseus. Softcover. PLACEHOLDER DESCRIPTION.', tags: ['theseus', 'book'], available: true, variants: [{ id: 'gid://shopify/ProductVariant/2', title: 'Default', price: '25.00', available: true }] },
  { handle: 'labyrinth-print', title: 'The Labyrinth — Giclée Print', type: 'Print', price: '40.00', currency: 'USD', image: '/images/products/print-1.svg', images: ['/images/products/print-1.svg'], description: 'Archival giclée print. PLACEHOLDER DESCRIPTION.', tags: ['theseus', 'print'], available: true, variants: [{ id: 'gid://shopify/ProductVariant/3', title: '11 × 14 in', price: '40.00', available: true }, { id: 'gid://shopify/ProductVariant/4', title: '18 × 24 in', price: '75.00', available: true }] },
  { handle: 'ariadne-print', title: 'Ariadne — Giclée Print', type: 'Print', price: '40.00', currency: 'USD', image: '/images/products/print-2.svg', images: ['/images/products/print-2.svg'], description: 'Archival giclée print. PLACEHOLDER DESCRIPTION.', tags: ['theseus', 'print'], available: true, variants: [{ id: 'gid://shopify/ProductVariant/5', title: '11 × 14 in', price: '40.00', available: true }] },
  { handle: 'panomachea-print', title: 'Panomachea — Key Art Print', type: 'Print', price: '45.00', currency: 'USD', image: '/images/products/print-3.svg', images: ['/images/products/print-3.svg'], description: 'Archival giclée print. PLACEHOLDER DESCRIPTION.', tags: ['panomachea', 'print'], available: true, variants: [{ id: 'gid://shopify/ProductVariant/6', title: '12 × 16 in', price: '45.00', available: true }] },
  { handle: 'theseus-page-12', title: 'Theseus — Original Page 12', type: 'Original', price: '350.00', currency: 'USD', image: '/images/products/original-1.svg', images: ['/images/products/original-1.svg'], description: 'Original ink page on bristol board. One of a kind. PLACEHOLDER DESCRIPTION.', tags: ['theseus', 'original'], available: true, variants: [{ id: 'gid://shopify/ProductVariant/7', title: 'Original', price: '350.00', available: true }] },
  { handle: 'portrait-study-original', title: 'Portrait Study — Original', type: 'Original', price: '600.00', currency: 'USD', image: '/images/products/original-2.svg', images: ['/images/products/original-2.svg'], description: 'Original graphite drawing. PLACEHOLDER DESCRIPTION.', tags: ['original'], available: false, variants: [{ id: 'gid://shopify/ProductVariant/8', title: 'Original', price: '600.00', available: false }] },
];

// PLACEHOLDER news items; YouTube videos are merged in at build time when a channel ID is set.
export type NewsItem = { date: string; title: string; summary: string; href: string; source: 'Studio' | 'YouTube' | 'X' | 'Shop'; image?: string };
export const studioNews: NewsItem[] = [
  { date: '2026-10-20', title: 'New site launch', summary: 'Portfolio, projects and shop now live in one place.', href: '/news/', source: 'Studio' },
  { date: '2026-09-15', title: 'Theseus prints restocked', summary: 'Giclée prints from Volume 1 are back in the shop.', href: '/shop/', source: 'Shop', image: '/images/products/print-1.svg' },
  { date: '2026-08-01', title: 'Panomachea development update', summary: 'Early process pages and character studies.', href: '/projects/panomachea/', source: 'Studio', image: '/images/projects/panomachea-01.svg' },
];
