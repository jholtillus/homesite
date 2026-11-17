# Theseus project site

The Theseus subdomain (theseus.<your domain>). It builds from this same repository as the main site.

```bash
npm run dev:theseus      # http://localhost:4321
npm run build:theseus    # output in dist-theseus/
```

## Content
- **Text, volumes, sample pages:** `theseus/src/data/theseus.ts`. The copy is edited from the three Kickstarter campaigns.
- **Images:** `theseus/public/images/`.
- **Prices and buy links:** read from the main site's `src/data/products.json`; "Buy" goes to the main site's shop pages.

## Adding pages to the online reader
1. Put the page scans in `theseus/public/read/vol1/`, named `001.jpg`, `002.jpg` and so on. Use about 1600 px tall, JPEG at around 80% quality.
2. In `theseus/src/data/theseus.ts`, set `EXT` to `'jpg'` and `COUNT` to the number of pages.
3. Delete the placeholder `.svg` files.

## Hosting on AWS Amplify
1. In Amplify, create a second app from the same `homesite` repository and `main` branch.
2. Under **Environment variables**, add:
   - `SITE` = `theseus`
   - `THESEUS_URL` = `https://theseus.<domain>`
   - `PUBLIC_MAIN_URL` = `https://<domain>`
3. Under **Domain management**, add the subdomain `theseus.<domain>`.
4. On the main site's Amplify app, set `PUBLIC_THESEUS_URL` = `https://theseus.<domain>` so its "Full project site" links point here.

`amplify.yml` already builds the right site based on `SITE`.
