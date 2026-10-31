# Compact catalogue / Next.js

The active application is Next.js + React + TypeScript, `src/catalog-app.tsx`. `src/catalog.css` replaces the older promotional layout. The older Vite files are not imported or included in the active TypeScript project.

## Implemented
- Compact responsive rows (roughly 185 CSS px on mobile), desktop list/grid, short descriptions, favorite and compare controls.
- Min/max year, price, mileage, displacement and power; brand/model, type, region, condition, seller, transmission, fuel and photo filters. Form uses matching fields.
- Desktop filter panel and full-height mobile filter dialog with visible apply button, validation, keyboard and safe areas.
- Three-step ad editor, image compression/reordering, draft/edit/active/sold/delete flows, private seller and dealer profiles. Two active listings per private demo profile; editing an existing listing does not consume another slot.
- Real prerendered URLs for public seeded listings, dealers, catalogue and account pages. Existing hash URLs redirect to these pages. HTML includes listings before JavaScript executes. Demo stays noindex.
- Dark/light preference, preserved legacy listings and favorites, comparisons of three bikes, demo documents section.

## Not production services
All writes remain in localStorage. Choosing a demo profile is NOT authentication or authorization. Limits are client-side demo logic, not billing enforcement. Private user accounts, payment, Tabidoo, mail and vehicle history are not connected. Use test contacts only. Local photos are compressed, storage quota failures are shown, and failed writes do not report success. Demo photos are illustrative.

## Tabidoo next step
Use a server-side adapter with validated authenticated owners, schema validation, rate limits, photo storage and caching. Never put API keys in browser code, public repo or NEXT_PUBLIC variables. GitHub Pages serves the static preview only; live APIs and server-rendered database listings will need a server-capable deployment. No new paid services have been created.

## Tooling
`npm install`, `npm run dev`, `npm run build`, `npm run preview`, `npm test`, `npm run test:e2e`.
`scripts/prepare-next.mjs` is an idempotent migration for the earlier draft files. The deploy workflow commits its verified output back into source along with the Pages-compatible export. After that the migration is a no-op.

CI checks TS/build, real static routes, unit tests and Chromium/WebKit mobile flows. Browser screenshots are attached to the Actions run as browser-qa. Tests are browser emulation, not a physical-device test.
