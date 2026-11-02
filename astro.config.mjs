import { defineConfig } from 'astro/config';

// Static output: the build in dist/ is uploaded to S3 and served by CloudFront.
export default defineConfig({
  site: process.env.SITE_URL || 'https://jordanholt.art',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
