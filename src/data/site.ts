// Central content file. Copy and imagery are drawn from jordanholt.art, panomachea.com and
// carthageworkshop.com. Image sizes come from image-sizes.json (python3 scripts/image-sizes.py).
import sizes from './image-sizes.json';

export type Img = { src: string; w: number; h: number; alt: string };
export const img = (src: string, alt = ''): Img => {
  const [w, h] = (sizes as Record<string, number[]>)[src] ?? [1200, 1500];
  return { src, w, h, alt };
};

export const site = {
  name: 'Jordan Holt',
  alias: 'J. Holt the Illustrator',
  tagline: 'Art professor & Illustrator of books, games, comics & graphic novels.',
  intro: 'Also known by the monicker J. Holt the Illustrator. I draw primarily historical, mythological, religious, and literary works. I publish my own works and work with other publishers.',
  email: '', // Optional public address shown on the contact page. The form works without it.
  shopDomain: import.meta.env.PUBLIC_SHOPIFY_DOMAIN || 'carthageworkshop.com',
  apiUrl: import.meta.env.PUBLIC_API_URL || '',
  youtubeHandle: 'jholtillus',
  youtubeChannelId: import.meta.env.PUBLIC_YOUTUBE_CHANNEL_ID || '',
  twitterHandle: import.meta.env.PUBLIC_TWITTER_HANDLE || 'jholtillus',
};

export const nav = [
  { label: 'Work', href: '/work/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Shop', href: '/shop/' },
  { label: 'News', href: '/news/' },
  { label: 'About', href: '/about/' },
  { label: 'Commissions', href: '/contact/' },
];

export const social = [
  { label: 'YouTube', key: 'youtube', href: 'https://youtube.com/@jholtillus' },
  { label: 'X', key: 'x', href: 'https://x.com/jholtillus' },
  { label: 'Instagram', key: 'instagram', href: 'https://instagram.com/jholtillus' },
  { label: 'Webtoon', key: 'webtoon', href: 'https://www.webtoons.com/en/canvas/theseus/list?title_no=656447' },
  { label: 'Substack', key: 'substack', href: 'https://jholtillus.substack.com/' },
];

// ---------------------------------------------------------------- Portfolio
export type Artwork = Img & { slug: string; title: string; project: string; note?: string };
const a = (slug: string, title: string, project: string, note?: string): Artwork => ({ ...img(`/images/art/${slug}.jpg`, title), slug, title, project, note });

// Order follows the gallery on jordanholt.art.
export const artwork: Artwork[] = [
  a('all-hallows', 'All Hallows’', 'Fine Art', 'Watercolor on watercolor paper'),
  a('in-desert-wilderness-7', 'In Desert & Wilderness #7', 'In Desert & Wilderness'),
  a('nice-manners-for-a-thief', 'Nice Manners for a Thief', 'Fine Art', 'Watercolor and ink'),
  a('in-desert-wilderness-5', 'In Desert & Wilderness #5', 'In Desert & Wilderness'),
  a('dantes-inferno-cover-concept', 'Dante’s Inferno Cover Concept', 'Illustration'),
  a('anglo-saxon-concept', 'Anglo-Saxon Concept Art', 'PetraCor'),
  a('petracor-opening-page', 'Opening page of PetraCor', 'PetraCor'),
  a('petracor-concept-1', 'Concept Art from PetraCor', 'PetraCor'),
  a('blood-and-water-cover', 'Blood & Water Cover', 'Blood & Water'),
  a('petracor-concept-2', 'PetraCor Concept Art', 'PetraCor'),
  a('petracor-page-section', 'PetraCor Page Section', 'PetraCor'),
  a('in-desert-wilderness-1', 'In Desert & Wilderness #1', 'In Desert & Wilderness'),
  a('in-desert-wilderness-2', 'In Desert & Wilderness #2', 'In Desert & Wilderness'),
  a('blood-and-water-page-1', 'Page from Blood & Water', 'Blood & Water'),
  a('blood-and-water-page-2', 'Page from Blood & Water', 'Blood & Water'),
  a('theseus-vol3-page-1', 'Page from Theseus Vol. 3', 'Theseus'),
  a('theseus-vol3-page-2', 'Page from Theseus Vol. 3', 'Theseus'),
  a('theseus-vol3-page-3', 'Page from Theseus Vol. 3', 'Theseus'),
  a('panomachea-card-back', 'Panomachea Card Back', 'Panomachea'),
  a('wanderer', 'Mithrandir', 'Fine Art', 'Ink and natural pigment watercolors'),
  a('witch-of-hobomock-pass-cover', 'The Witch of Hobomock Pass — Cover', 'The Witch of Hobomock Pass', 'Acrylic gouache and watercolor'),
  a('hobomock-in-the-fort', 'In the Fort', 'The Witch of Hobomock Pass', 'Ink on watercolor paper'),
  a('hobomock-hellhound', 'Encounter with a Hellhound', 'The Witch of Hobomock Pass', 'Ink on watercolor paper'),
  a('hobomock-king-of-the-forest', 'A Glimpse of the King of the Forest', 'The Witch of Hobomock Pass', 'Ink on watercolor paper'),
  a('hobomock-grandfathers', 'A View of the Grandfathers', 'The Witch of Hobomock Pass', 'Ink on watercolor paper'),
];

// ---------------------------------------------------------------- Projects
export type Block =
  | { kind: 'text'; heading?: string; paras: string[] }
  | { kind: 'image'; image: Img; caption?: string; wide?: boolean }
  | { kind: 'gallery'; images: Img[] }
  | { kind: 'list'; heading: string; items: string[] };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  partner?: string;
  status: 'Available' | 'Upcoming' | 'Published';
  summary: string;
  cover: Img;        // card image on index pages
  hero: Img;         // banner on project page
  heroDark?: boolean;
  facts: { label: string; value: string }[];
  links: { label: string; href: string }[];
  productTags: string[];
  blocks: Block[];
};

const P = '/images/projects/panomachea/';
const prod = (f: string, alt: string) => img(`/images/products/${f}.jpg`, alt);
const art = (s: string) => artwork.find((x) => x.slug === s)!;

export const projects: Project[] = [
  {
    slug: 'theseus',
    title: 'Theseus',
    kicker: 'Graphic novel',
    status: 'Available',
    summary: 'An action-adventure retelling of the myth of Theseus, from his journey to Athens through bandits and beasts to his ultimate confrontation with the legendary minotaur. Told with humor and heart.',
    cover: prod('theseus-the-full-collection-digital-1', 'Theseus, Volume One cover art'),
    hero: prod('theseus-vol-2-digital-1', 'Theseus, Volume Two cover art'),
    heroDark: true,
    facts: [
      { label: 'Format', value: 'Three-volume graphic novel' },
      { label: 'Length', value: '470+ full color pages' },
      { label: 'Edition', value: 'Sewn-bound hardcovers in slipcase' },
      { label: 'Rating', value: '12+' },
    ],
    links: [
      { label: 'Read on Webtoon', href: 'https://www.webtoons.com/en/canvas/theseus/list?title_no=656447' },
      { label: 'theseuscomic.com', href: 'https://theseuscomic.com' },
    ],
    productTags: ['theseus'],
    blocks: [
      { kind: 'text', paras: [
        'Theseus began as a web comic and grew into a three-volume graphic novel — a retelling of the Ancient Greek hero’s life that follows him from his journey to Athens, through bandits and beasts, to the labyrinth of King Minos.',
        'The series is complete. Volume 3 brings the story to its conclusion: Theseus travels to Crete to confront King Minos’ minotaur in the legendary labyrinth.',
      ] },
      { kind: 'gallery', images: [prod('theseus-the-full-collection-digital-1', 'Volume One'), prod('theseus-vol-2-digital-1', 'Volume Two'), prod('theseus-vol-3-digital-1', 'Volume Three')] },
      { kind: 'text', heading: 'The full collection', paras: ['All three volumes as sewn-bound hardcovers in a high quality slipcase — 470+ full color pages. Available signed or unsigned, with free US shipping.'] },
      { kind: 'gallery', images: [prod('theseus-the-full-collection-1', 'The full collection slipcase'), prod('theseus-the-full-collection-2', 'The full collection slipcase, reverse')] },
      { kind: 'text', heading: 'Pages', paras: ['Interior pages from Volume 3.'] },
      { kind: 'gallery', images: [art('theseus-vol3-page-1'), art('theseus-vol3-page-2'), art('theseus-vol3-page-3'), prod('theseus-the-full-collection-6', 'Page from Theseus')] },
    ],
  },
  {
    slug: 'panomachea',
    title: 'Panomachea',
    kicker: 'Card game',
    status: 'Available',
    summary: 'A card game of mythic proportions. All-out mythological war in this competitive card-capture game — fight with the gods, heroes and monsters of Ancient Greek myth.',
    cover: prod('panomachea-battle-with-gods-heroes-monsters-1', 'Panomachea deck'),
    hero: img(P + 'hero-bg.jpg', 'Panomachea cards spread on a table'),
    heroDark: true,
    facts: [
      { label: 'Players', value: '2–5, every man for himself or teams' },
      { label: 'Ages', value: '10+' },
      { label: 'Deck', value: '84 cards, 67 unique illustrations' },
      { label: 'Stock', value: 'High quality black core, linen texture' },
    ],
    links: [
      { label: 'Rules & manual', href: 'https://playpanomachea.com' },
      { label: 'panomachea.com', href: 'https://panomachea.com' },
    ],
    productTags: ['panomachea'],
    blocks: [
      { kind: 'image', image: img(P + 'logo-color.png', 'Panomachea logo') },
      { kind: 'text', paras: [
        'Panomachea is an original, all-out mythological battle game. Capture the most cards to win. Fight with the gods, heroes and monsters of Ancient Greek myth.',
        'This is the kind of game that you’ll remember playing. It gives you every opportunity to pull off those staggering wins you’ll lord over your friends for years, and all but guarantees you’ll eventually face the crushing defeat that can only come when you’re absolutely sure of victory.',
      ] },
      { kind: 'image', image: img(P + 'heroes-strip.png', 'Poseidon, Artemis and Heracles'), wide: true },
      { kind: 'text', heading: 'Built for casual play', paras: [
        'Meticulously created by an illustrator fanatical about myth and history, Panomachea stays faithful to the visuals and narratives of Greek mythology while offering just enough twist on the visuals of Ancient Greece to make a unique interpretation of these classic characters.',
        'You can learn it quickly and play right away. But the more you play, the deeper it goes. There’s enough complexity to allow for strategic play and surprises in every game. But like any Ancient Greek story, Chaos is ever-present, and you can never be too certain of a winning hand.',
        'Neither as complex as a deck-builder or as simple as most casual games, this is a strategy card game that pulls from the unique myths of Greece and uses them to create a rich tableau of 56 hand-illustrated Fighter Cards, each with their own unique abilities, strengths and weaknesses. The total 84 card deck includes Tyche (Chance or Fortune) Cards and four World Cards that keep the upper hand shifting throughout the game.',
      ] },
      { kind: 'gallery', images: [img(P + 'deck-box.jpg', 'Panomachea deck and box'), img(P + 'card-specs.jpg', '84 total cards: 56 unique character cards, 24 Tyche cards, 4 World cards')] },
      { kind: 'image', image: img(P + 'the-art.jpg', 'The Art'), wide: true },
      { kind: 'text', heading: 'The art', paras: [
        'The 67 unique card illustrations in this 84 card deck were drawn in their entirety by the same person who designed the game mechanics.',
        'As an enthusiast of Classical history and an ancient mythology obsessive, I’ve tried to give these card designs a strong degree of cultural fidelity — even using Greek pottery to guide the character designs — while also giving the characters new color and flavor to better distinguish them from one another and make them visually striking.',
      ] },
      { kind: 'image', image: img(P + 'three-cards.jpg', 'Hades, Centaur and Odysseus cards'), wide: true },
      { kind: 'gallery', images: [img(P + 'ink-illustration.jpg', 'Ink illustration for Panomachea'), img(P + 'card-anatomy.jpg', 'Anatomy of a Fighter Card')] },
      { kind: 'text', heading: 'Suits, Worlds & Tyche', paras: [
        'Every one of the 56 Fighter Cards has an original interpretation of the Immortal, Hero or mythological Beast, in addition to the character’s Power Level, name (both the Latinized version and the Ancient Greek spelling), a brief description and a clearly defined suit.',
        'There are four suits in Panomachea: the Sky, Sea, Earth and Fire. Each suit has its Power Level boosted by a World Card, which switches throughout the game. Tyche Cards allow the player to shake up the Field of Battle and employ gambits to lose big or win it all.',
      ] },
      { kind: 'gallery', images: [img(P + 'world-cards.jpg', 'World cards boost a suit: Fire, Earth, Sea, Sky'), img(P + 'tyche-cards.jpg', 'Tyche cards')] },
    ],
  },
  {
    slug: 'blood-and-water',
    title: 'Blood & Water',
    kicker: 'YA graphic novel',
    partner: 'Ignatius Press',
    status: 'Published',
    summary: 'The Life & Martyrdom of Shahbaz Bhatti — a young adult graphic novel illustrated for Ignatius Press.',
    cover: art('blood-and-water-cover'),
    hero: art('blood-and-water-page-1'),
    facts: [{ label: 'Publisher', value: 'Ignatius Press' }, { label: 'Format', value: 'YA graphic novel' }],
    links: [{ label: 'Ignatius Press', href: 'https://ignatius.com/blood-and-water-6bwh/' }],
    productTags: [],
    blocks: [
      { kind: 'text', paras: ['Blood & Water: The Life & Martyrdom of Shahbaz Bhatti, illustrated for Ignatius Press.'] },
      { kind: 'gallery', images: [art('blood-and-water-cover'), art('blood-and-water-page-1'), art('blood-and-water-page-2')] },
    ],
  },
  {
    slug: 'in-desert-and-wilderness',
    title: 'In Desert & Wilderness',
    kicker: 'Illustrated novel',
    partner: 'Old Sovereign Publishing',
    status: 'Published',
    summary: 'Illustrations for In Desert & Wilderness, published with Old Sovereign Publishing.',
    cover: art('in-desert-wilderness-1'),
    hero: art('in-desert-wilderness-5'),
    facts: [{ label: 'Publisher', value: 'Old Sovereign Publishing' }],
    links: [{ label: 'Old Sovereign Publishing', href: 'https://oldsovereignpublishing.com/products/in-desert-and-wilderness' }],
    productTags: [],
    blocks: [
      { kind: 'text', paras: ['Illustrations for In Desert & Wilderness, published by Old Sovereign Publishing.'] },
      { kind: 'gallery', images: [art('in-desert-wilderness-1'), art('in-desert-wilderness-2'), art('in-desert-wilderness-5'), art('in-desert-wilderness-7')] },
    ],
  },
  {
    slug: 'witch-of-hobomock-pass',
    title: 'The Witch of Hobomock Pass',
    kicker: 'Frontier fantasy novel',
    partner: 'Written by Michael F. Kane',
    status: 'Published',
    summary: 'A frontier fantasy novel by Michael F. Kane: painted cover, illustrated title text, and interior ink illustrations.',
    cover: art('witch-of-hobomock-pass-cover'),
    hero: art('witch-of-hobomock-pass-cover'),
    heroDark: true,
    facts: [{ label: 'Author', value: 'Michael F. Kane' }, { label: 'Cover', value: 'Acrylic gouache and watercolor' }, { label: 'Interiors', value: 'Ink on watercolor paper' }],
    links: [],
    productTags: [],
    blocks: [
      { kind: 'text', paras: ['Written by Michael F. Kane, this novel is a frontier fantasy for which I painted the cover (acrylic gouache and watercolor), illustrated the title text, and completed the interior ink illustrations.'] },
      { kind: 'gallery', images: [art('hobomock-in-the-fort'), art('hobomock-hellhound'), art('hobomock-king-of-the-forest')] },
      { kind: 'image', image: art('hobomock-grandfathers'), caption: 'A View of the Grandfathers. Ink on watercolor paper.', wide: true },
    ],
  },
  {
    slug: 'petracor',
    title: 'PetraCor',
    kicker: 'Anglo-Saxon graphic novel',
    status: 'Upcoming',
    summary: 'An upcoming graphic novel set in Anglo-Saxon England. The protagonist wanders through the forests and fens of Mercia.',
    cover: art('petracor-concept-1'),
    hero: art('petracor-opening-page'),
    heroDark: true,
    facts: [{ label: 'Status', value: 'In development' }],
    links: [],
    productTags: ['petracor'],
    blocks: [
      { kind: 'text', paras: ['Concept art and early pages from the upcoming Anglo-Saxon graphic novel PetraCor. Join the mailing list to hear when it launches.'] },
      { kind: 'gallery', images: [art('petracor-opening-page'), art('petracor-concept-1'), art('petracor-concept-2'), art('anglo-saxon-concept'), art('petracor-page-section'), prod('wandering-thane-1', 'Wandering Thane')] },
    ],
  },
];

export const upcoming = ['PetraCor — Anglo-Saxon graphic novel', 'TBA Card Game', 'TBA Book'];

// ---------------------------------------------------------------- Shop
export type ProductType = 'Original' | 'Print' | 'Book' | 'Game' | 'Digital';
export type Product = {
  handle: string; title: string; type: ProductType; price: string; currency: string;
  image: string; images: string[]; description: string; tags: string[]; available: boolean;
  variants: { id: string; title: string; price: string; available: boolean }[];
};
// Used only when neither src/data/products.json nor a Storefront token is present.
export const fallbackProducts: Product[] = [];

// ---------------------------------------------------------------- News
export type NewsItem = { date?: string; title: string; summary: string; href: string; source: 'Studio' | 'YouTube' | 'Substack' | 'Shop'; image?: string };
// Pinned studio announcements (undated items stay at the top). Substack posts and YouTube
// videos are merged in at build time from their public feeds.
export const studioNews: NewsItem[] = [
  { title: 'Theseus Vol. 3 is here', summary: 'The series conclusion: Theseus travels to Crete to confront King Minos’ minotaur in the legendary labyrinth.', href: '/shop/theseus-vol-3-hardcover/', source: 'Shop', image: '/images/products/theseus-vol-3-digital-1.jpg' },
  { title: 'Panomachea Deluxe', summary: 'The deck plus 4 unique holographic cards, a deluxe box and the Panomachea coin.', href: '/shop/panomachea-deluxe/', source: 'Shop', image: '/images/products/panomachea-deluxe-1.jpg' },
];
