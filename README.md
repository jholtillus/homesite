# jordanholt.art — first draft

A static Astro site served from AWS (S3 + CloudFront), with a headless Shopify cart, a contact form, and a mailing list that runs on API Gateway, Lambda and SES.

| Area | Route(s) | Notes |
|---|---|---|
| Portfolio | `/`, `/work/`, `/about/` | Filterable masonry grid with lightbox (supports keyboard and swipe) |
| Client contact | `/contact/` | POST `/contact` → Lambda → SES, with reply-to set to the client |
| Shop (headless) | `/shop/`, `/shop/<handle>/` | Cart stored in the browser. Checkout hands off to Shopify checkout on carthageworkshop.com |
| Projects | `/projects/`, `/projects/theseus/`, `/projects/panomachea/` | Brings theseuscomic.com and panomachea.com together. Add a project by adding an entry to `projects` in `src/data/site.ts` |
| Social / updates | `/news/`, `/rss.xml` | YouTube feed and latest video, X timeline embed, RSS |
| Mailing list | Every page footer band | POST `/subscribe` → Shopify customer with email-marketing consent. Send launch emails with Shopify Email |

## Local development
```bash
npm install
npm run dev        # http://localhost:4321
```

## Content
- **Copy, portfolio and projects:** `src/data/site.ts`. Text and imagery come from jordanholt.art, panomachea.com and carthageworkshop.com.
- **Products:** `src/data/products.json`, with images in `public/images/products/`. Refresh both with:
  ```bash
  NODE_USE_ENV_PROXY=1 npm run pull-images
  python3 scripts/image-sizes.py
  ```
  The proxy variable is only needed behind a proxy. The pull also saves the original site images to `source-images/`, which git ignores.
- **Adding artwork:** put images in `public/images/art/`, run `python3 scripts/image-sizes.py`, then add an entry to `artwork` in `site.ts`.
- **Adding a project:** add an entry to `projects` in `site.ts`. Its page is built from `blocks` (text, image, gallery). Shop products whose title mentions the project are linked to it automatically.
- **News:** pinned items are in `studioNews`. Substack posts (jholtillus.substack.com) and YouTube videos (@jholtillus) are pulled in at build time. Set `PUBLIC_YOUTUBE_CHANNEL_ID` if the handle lookup fails.

## Shopify checkout
- **Without a token:** the cart redirects to `https://carthageworkshop.com/cart/<variant>:<qty>,…`, Shopify's cart permalink.
- **With `PUBLIC_SHOPIFY_STOREFRONT_TOKEN`:** products load from the Storefront API at build time, and checkout uses `cartCreate` → `checkoutUrl`. To get a token, enable the Headless channel or a custom app with Storefront API access. It is a public token.
- **Rebuilds:** prices and stock refresh on each build, so rebuild and deploy after catalogue changes, or schedule a rebuild.

## AWS deployment
1. **SES:** verify the sending domain or address in SES, and request production access.
2. **Certificate (optional):** request an ACM certificate in **us-east-1** for `jordanholt.art` and `www.jordanholt.art`.
3. **Shopify Admin token:** create a custom app in Shopify with the `write_customers` scope.
4. **Deploy the stack:**
   ```bash
   cd infra
   sam build && sam deploy --guided --stack-name jordanholt-site
   ```
5. **Publish the site:**
   ```bash
   STACK=jordanholt-site npm run deploy
   ```
   This builds with `PUBLIC_API_URL` taken from the stack, syncs to S3, and invalidates CloudFront.
6. **DNS:** point `jordanholt.art` and `www` at the CloudFront distribution, using Route 53 alias records or CNAMEs.

## Environment
See `.env.example`. Set `PUBLIC_YOUTUBE_CHANNEL_ID` and `PUBLIC_TWITTER_HANDLE` to turn on the social feeds.
