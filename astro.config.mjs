import { defineConfig } from 'astro/config';

// One repository, three static sites:
//   npm run build              -> the main site (jordanholt.art) in dist/
//   npm run build:theseus      -> the Theseus site (theseus.<domain>) in dist-theseus/
//   npm run build:panomachea   -> the Panomachea site (panomachea.<domain>) in dist-panomachea/
// ARTIFACT=1 builds the claude.ai preview variants (CSS inlined) into dist-artifact*/.
const SUB = ['theseus', 'panomachea'].includes(process.env.SITE ?? '') ? process.env.SITE : '';
const ARTIFACT = !!process.env.ARTIFACT;
const URLS = {
  '': process.env.SITE_URL || 'https://jordanholt.art',
  theseus: process.env.THESEUS_URL || 'https://theseus.jordanholt.art',
  panomachea: process.env.PANOMACHEA_URL || 'https://panomachea.jordanholt.art',
};

export default defineConfig({
  site: URLS[SUB],
  srcDir: SUB ? `./${SUB}/src` : './src',
  publicDir: SUB ? `./${SUB}/public` : './public',
  outDir: `./dist${ARTIFACT ? '-artifact' : ''}${SUB ? `-${SUB}` : ''}`,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: ARTIFACT ? 'always' : 'auto',
  },
});
