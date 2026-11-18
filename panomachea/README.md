# Panomachea project site

The Panomachea subdomain (panomachea.<your domain>). It builds from this same repository as the main site.

```bash
npm run dev:panomachea      # http://localhost:4321
npm run build:panomachea    # output in dist-panomachea/
```

## Content
- **Text:** `panomachea/src/pages/index.astro`. The copy is taken from the Kickstarter campaign, panomachea.com and the Shopify product descriptions.
- **Cards:** `panomachea/public/images/cards/`, named `suit_nn_name.jpg` (`sky_`, `sea_`, `eth_`, `fir_`, plus `tyc_` and `wld_`). The deck gallery reads this folder, so adding or replacing a file there updates the site.
- **Other images:** `panomachea/public/images/`. Full-size originals are in `panomachea/originals/` (not deployed).
- **Prices and buy links:** read from the main site's `src/data/products.json`; the deck cards link to the main site's shop pages.

## Hosting on AWS Amplify
1. In Amplify, create another app from the same `homesite` repository and `main` branch.
2. Under **Environment variables**, add:
   - `SITE` = `panomachea`
   - `PANOMACHEA_URL` = `https://panomachea.<domain>`
   - `PUBLIC_MAIN_URL` = `https://<domain>`
3. Under **Domain management**, add the subdomain `panomachea.<domain>`.
4. On the main site's Amplify app, set `PUBLIC_PANOMACHEA_URL` = `https://panomachea.<domain>` so its "Full project site" links point here.

`amplify.yml` already builds the right site based on `SITE`.
