import { defineConfig } from 'astro/config';

// One repository, two static sites:
//   npm run build           -> the main site (jordanholt.art) in dist/
//   npm run build:theseus   -> the Theseus site (theseus.<domain>) in dist-theseus/
// ARTIFACT=1 builds the claude.ai preview variants (CSS inlined) into dist-artifact*/.
const THESEUS = process.env.SITE === 'theseus';
const ARTIFACT = !!process.env.ARTIFACT;

export default defineConfig({
  site: THESEUS ? process.env.THESEUS_URL || 'https://theseus.jordanholt.art' : process.env.SITE_URL || 'https://jordanholt.art',
  srcDir: THESEUS ? './theseus/src' : './src',
  publicDir: THESEUS ? './theseus/public' : './public',
  outDir: `./dist${ARTIFACT ? '-artifact' : ''}${THESEUS ? '-theseus' : ''}`,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: ARTIFACT ? 'always' : 'auto',
  },
});
