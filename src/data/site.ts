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

// Shop products for each artwork (handles), used by the Work page lightbox.
export const artworkProducts: Record<string, string[]> = {
  'all-hallows': ['all-hallows-print', 'all-hallows-original-artwork'],
  'nice-manners-for-a-thief': ['good-manners-print', 'good-manners-for-a-thief'],
  'wanderer': ['mithrandir'],
  'panomachea-card-back': ['panomachea-battle-with-gods-heroes-monsters'],
  'theseus-vol3-page-1': ['theseus-vol-3-hardcover'],
  'theseus-vol3-page-2': ['theseus-vol-3-hardcover'],
  'theseus-vol3-page-3': ['theseus-vol-3-hardcover'],
};

// ---------------------------------------------------------------- Projects
export type Block =
  | { kind: 'text'; heading?: string; paras: string[] }
  | { kind: 'image'; image: Img; caption?: string; wide?: boolean }
  | { kind: 'gallery'; images: Img[] }
  | { kind: 'list'; heading: string; items: string[] };

// A book sold by its publisher: shown on the Projects page like the mini shop, linking out.
export type External = { seller: string; url: string; title: string; price: string; format?: string; desc: string; image: Img };

export type Project = {
  slug: string;
  title: string;
  logo?: Img;        // shown in place of the title on the home page
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
  featured?: boolean; // shown in the home page "Projects" section
  // Larger projects get their own site (subdomain). url empty = site not built yet ("coming soon").
  site?: { url: string; name: string };
  // Projects page case study. Paragraphs default to placeholders until written.
  // images pair with paras 1–4 (alternating sides); closing is the full-width final paragraph.
  caseStudy?: { images?: Img[]; paras?: string[]; closing?: string; feature?: Img; featureCaption?: string; shop?: string; external?: External }; // shop: Shopify handle shown as a mini shop in place of the feature image
};

export const THESEUS_URL = (import.meta.env.PUBLIC_THESEUS_URL || 'https://theseus.jordanholt.art').replace(/\/$/, '');
export const PANOMACHEA_URL = (import.meta.env.PUBLIC_PANOMACHEA_URL || 'https://panomachea.jordanholt.art').replace(/\/$/, '');

export const caseStudyPlaceholders = (title: string) => [
  `PLACEHOLDER — Origin. How ${title} began: the idea, the source material, and who it was made for.`,
  `PLACEHOLDER — Research. The references behind ${title}: history, myth, museum pieces, period costume and architecture.`,
  `PLACEHOLDER — Process. Thumbnails to finished art: pencils, inks, watercolor, color flats and lettering, and how long each stage took.`,
  `PLACEHOLDER — Result. How ${title} was published or released, how readers and players responded, and what came next.`,
];
export const caseStudyClosing = (title: string) =>
  `PLACEHOLDER — Closing. A final word on ${title}: what you learned, what you would do differently, and where the story goes from here.`;

const P = '/images/projects/panomachea/';
const prod = (f: string, alt: string) => img(`/images/products/${f}.jpg`, alt);
const art = (s: string) => artwork.find((x) => x.slug === s)!;

export const projects: Project[] = [
  {
    slug: 'theseus',
    logo: { src: '/images/theseus-logo.png', alt: 'Theseus', w: 800, h: 192 },
    site: { url: THESEUS_URL, name: 'Theseus' },
    caseStudy: {
      feature: prod('theseus-the-full-collection-1', 'Theseus: The Full Collection'), featureCaption: 'Theseus: The Full Collection', shop: 'theseus-the-full-collection',
      paras: [
        'Began in 2020, Theseus is a full and detailed retelling of the myth, novelized and worked into a coming-of-age tale full of comedy and adventure.',
        'This is more like what happens if someone loves Greek mythology very much, studies it in-depth along with the culture, language and history of that period, is fascinated by the idea of a true story behind the myth, but is simply not a serious person.',
        'These graphic novels are written, meticulously hand-drawn and colored by me, Jordan Holt. I don’t use AI in any form. I’ve spent about 1000 very pleasant hours writing and illustrating Volume 1.',
        'Readers have watched Theseus grow in confidence and strength over the course of Volume I & II, but his boyish absurdity still remains. This series is marked by its merger of mythology and comedy.',
      ],
      closing: 'Theseus is a long-standing passion project for me. I hope you enjoy reading it as much as I’ve enjoyed creating it. Immerse yourself in the world of myth.',
    },
    featured: true,
    title: 'Theseus',
    kicker: 'Graphic novel',
    status: 'Available',
    // Theseus text is taken verbatim from the Kickstarter campaigns.
    summary: 'I’ve taken the narrative of his life directly from the ancient writings of Plutarch and spun it into a colorful, fully-illustrated, coming-of-age adventure both sincere and humorous.',
    cover: prod('theseus-the-full-collection-digital-1', 'Theseus Vol. 1'),
    hero: prod('theseus-vol-2-digital-1', 'Theseus Vol. 2'),
    heroDark: true,
    facts: [
      { label: 'Volume 1', value: '148 pages' },
      { label: 'Volume 2', value: '172 pages' },
      { label: 'Volume 3', value: '168 pages' },
    ],
    links: [],
    productTags: ['theseus'],
    blocks: [
      { kind: 'text', paras: [
        'Theseus is a well-known figure in mythology for defeating bandits, killing the minotaur, and ruling over Athens. While the story itself is a fable, there is likely a true story that undergirds the legend. This is most definitely not it.',
        'This is a lovingly faithful retelling of the myth’s broader story according to Plutarch, but crafted into a compelling coming-of-age story garnished with ample humor and an unusually high number of interfering deities.',
      ] },
      { kind: 'gallery', images: [prod('theseus-the-full-collection-digital-1', 'Theseus Vol. 1'), prod('theseus-vol-2-digital-1', 'Theseus Vol. 2'), prod('theseus-vol-3-digital-1', 'Theseus Vol. 3')] },
      { kind: 'text', paras: [
        'Young Theseus starts off like any teenager burdened with responsibility: he avoids it. But while encountering vicious bandits (each with their own brand of villainy) and mythological monsters, he begins the path towards a better and more capable version of himself...while still leaving room for humor.',
        'Each chapter behaves like an independent episode, containing its own story but leading us further down the path of the over-arching tale.',
      ] },
      { kind: 'gallery', images: [art('theseus-vol3-page-1'), art('theseus-vol3-page-2'), prod('theseus-the-full-collection-3', 'Theseus'), prod('theseus-the-full-collection-6', 'Theseus')] },
      { kind: 'text', paras: ['This is the complete Theseus collection, spanning nearly 500 pages.'] },
    ],
  },
  {
    slug: 'panomachea',
    site: { url: PANOMACHEA_URL, name: 'Panomachea' },
    caseStudy: { feature: img(P + 'three-cards.jpg', 'Hades, Centaur and Odysseus cards'), featureCaption: 'Fighter Cards: Hades, Centaur and Odysseus.' },
    featured: true,
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
    caseStudy: {
      feature: art('blood-and-water-page-2'), featureCaption: 'Page from Blood & Water.',
      external: {
        seller: 'Ignatius Press', url: 'https://ignatius.com/blood-and-water-6bwh/',
        title: 'Blood and Water', price: '$17.99', format: 'Paperback',
        desc: 'This graphic biography vividly chronicles Shahbaz Bhatti’s extraordinary life (1968–2011). His convictions were shaped by his Catholic faith and illuminated by courage, service, and sacrifice. Through powerful artwork woven with Gospel episodes that mirrored his mission, Blood and Water offers an unforgettable portrait of a servant-leader who refused to be silent in the face of injustice.',
        image: { src: '/images/projects/external/blood-and-water.jpg', alt: 'Blood and Water cover', w: 842, h: 1280 },
      },
    },
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
    caseStudy: {
      feature: art('in-desert-wilderness-7'), featureCaption: 'In Desert & Wilderness #7.',
      external: {
        seller: 'Old Sovereign Publishing', url: 'https://oldsovereignpublishing.com/products/in-desert-and-wilderness',
        title: 'In Desert And Wilderness', price: '£70.00',
        desc: 'The adventure of a lifetime awaits. Follow Stas and Nel as they are taken on a journey from civilisation in Port Said down through the deserts of upper Egypt and the Sudan, to the wide open and undiscovered wildernesses of central and eastern Africa.',
        image: { src: '/images/projects/external/in-desert-and-wilderness.jpg', alt: 'In Desert And Wilderness hardcover', w: 1050, h: 1400 },
      },
    },
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
    caseStudy: { feature: art('hobomock-grandfathers'), featureCaption: 'A View of the Grandfathers. Ink on watercolor paper.' },
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
    site: { url: '', name: 'PetraCor' },
    caseStudy: { feature: art('petracor-page-section'), featureCaption: 'PetraCor page section.' },
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

// ---------------------------------------------------------------- Home page
// Hero carousel. The heading stays fixed; each slide swaps the image, text and buttons.
// To put a new project "on deck", edit or reorder these entries.
export const heroHeading = { line1: 'Illustrating', em: 'history, myth and fable.', line2: '' };
export type HeroSlide = { label: string; image: Img; eyebrow: string; text: string; caption: string; primary: { label: string; href: string }; secondary?: { label: string; href: string } };
export const heroSlides: HeroSlide[] = [
  {
    label: 'Theseus Vol. 3',
    image: prod('theseus-vol-3-digital-1', 'Theseus, Volume Three cover art'),
    eyebrow: 'On deck · Graphic novel',
    text: 'Volume 3 picks up when the ships with black sails appear on the horizon in Athens’ port, and the people know that Minos has come to collect his tribute: fourteen tributes who will be fed to the monstrous Minotaur.',
    caption: 'Theseus, Vol. 3',
    primary: { label: 'See the project', href: '/projects/#theseus' },
    secondary: { label: 'Buy', href: '/shop/theseus-vol-3-hardcover/' },
  },
  {
    label: 'Panomachea',
    image: prod('panomachea-battle-with-gods-heroes-monsters-1', 'Panomachea deck'),
    eyebrow: 'Card game',
    text: 'Panomachea — all-out mythological war in a competitive card-capture game. Fight with the gods, heroes and monsters of Ancient Greek myth.',
    caption: 'Panomachea',
    primary: { label: 'See the project', href: '/projects/#panomachea' },
    secondary: { label: 'Buy', href: '/shop/panomachea-battle-with-gods-heroes-monsters/' },
  },
  {
    label: 'Commissions',
    image: img('/images/art/all-hallows.jpg', 'All Hallows’, watercolor'),
    eyebrow: 'Commissions open',
    text: 'Illustration for books, games, comics and graphic novels — historical, mythological, religious and literary work.',
    caption: 'All Hallows’',
    primary: { label: 'Commission', href: '/contact/' },
    secondary: { label: 'View work', href: '/work/' },
  },
];

// Portfolio grid on the home page (max 9, shown 3 × 3). Captions are placeholders.
// Hover buttons: "See the project" (project slug), "Prints" (print product handle),
// "For sale" (original product handle). Sold state comes from Shopify availability;
// set sold: true to force it.
export type FeaturedWork = { art: string; caption: string; project?: string; print?: string; original?: string; sold?: boolean };
export const featuredWork: FeaturedWork[] = [
  { art: 'all-hallows', caption: 'Artwork Title', print: 'all-hallows-print', original: 'all-hallows-original-artwork' },
  { art: 'nice-manners-for-a-thief', caption: 'Artwork Title', print: 'good-manners-print', original: 'good-manners-for-a-thief' },
  { art: 'wanderer', caption: 'Artwork Title', original: 'mithrandir' },
  { art: 'theseus-vol3-page-1', caption: 'Artwork Title', project: 'theseus' },
  { art: 'panomachea-card-back', caption: 'Artwork Title', project: 'panomachea' },
  { art: 'blood-and-water-cover', caption: 'Artwork Title', project: 'blood-and-water' },
  { art: 'petracor-concept-1', caption: 'Artwork Title', project: 'petracor' },
  { art: 'in-desert-wilderness-5', caption: 'Artwork Title', project: 'in-desert-and-wilderness' },
  { art: 'hobomock-hellhound', caption: 'Artwork Title', project: 'witch-of-hobomock-pass' },
];

// "Recent work" slider on the home page (shows four at a time).
export const recentWork = ['witch-of-hobomock-pass', 'petracor', 'theseus', 'panomachea', 'blood-and-water', 'in-desert-and-wilderness'];

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
  { title: 'Theseus Vol. 3 is here', summary: 'Theseus travels to Crete to confront King Minos’ minotaur in the legendary labyrinth.', href: '/shop/theseus-vol-3-hardcover/', source: 'Shop', image: '/images/products/theseus-vol-3-digital-1.jpg' },
  { title: 'Panomachea Deluxe', summary: 'The deck plus 4 unique holographic cards, a deluxe box and the Panomachea coin.', href: '/shop/panomachea-deluxe/', source: 'Shop', image: '/images/products/panomachea-deluxe-1.jpg' },
];
