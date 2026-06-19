# Coffee Cart Chronicles — Word Bank Trainer

Zemi barista trainer built with Vite + React. Practice all 15 menu drinks with a shared word bank and three difficulty tiers.

## Local development

```bash
npm install
npm run dev
npm test
npm run build
```

## End-to-end tests (Playwright)

Mobile E2E tests run against a production build served by Vite preview (iPhone 14 and Pixel 7 device profiles).

```bash
# First-time setup: install Playwright browsers
npx playwright install chromium webkit

# Run all mobile E2E tests (builds app, starts preview server automatically)
npm run test:e2e

# Run against an already-running preview server
npm run build && npm run preview
npm run test:e2e

# Run against the dev server instead (override base URL)
npm run dev
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npm run test:e2e
```

View the HTML report after a run:

```bash
npx playwright show-report
```

## Deploy (Vercel + GitHub)

Repo: [github.com/jacrook/coffee-cart-word-bank](https://github.com/jacrook/coffee-cart-word-bank)

1. Open [Import to Vercel](https://vercel.com/new/import?s=https://github.com/jacrook/coffee-cart-word-bank)
2. Sign in with GitHub and authorize Vercel if prompted
3. Confirm settings (auto-detected from `vercel.json`):
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy**

Future pushes to `main` redeploy automatically.

## Credits

Word-bank token icons from [ghostpixxells](https://ghostpixxells.itch.io) ([Pixel Mart](https://ghostpixxells.itch.io/pixel-mart), [Free Pixel foods](https://ghostpixxells.itch.io/pixelfood)) — CC0. To-go cup and ice cube icons are custom 32×32 sprites in the same style (`scripts/generate_cup_icons.py`).