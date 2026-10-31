# MotoBazar - mobile-first visual redesign

The catalog combines the light, clean search/listing concept with the photographic detail layout. Both pages use one shared light/dark theme. This is still the existing React/TypeScript prototype, not a production marketplace backend.

## Public interface
- Responsive catalog, text search, model/brand/type/location/price/year/mileage/seller filters and numeric sorting.
- Filter state in shared hash URLs; existing `#motorka/m-101`, dealer and dashboard routes remain compatible.
- Mobile filter sheet with draft/apply/reset, native modal semantics, Escape support, focus return and keyboard trapping.
- Large mobile cards, horizontal category navigation, bottom navigation, safe-area support and sticky contact action on details.
- Favorites and a three-bike comparison saved in the browser. Existing v3 listing/dealer/favorite storage is not renamed or wiped.
- Gallery/lightbox with keyboard, touch swipe and thumbnails when the listing actually has multiple images.
- Light/dark/system theme with pre-paint initialization and a reduced-motion preference.
- Dealer pages and the existing dealer studio remain available. The studio is loaded on demand.

## Explicit limitations
Listings, sellers and photographs are illustrative. Photos may not depict the named model. There is no authentication, shared database, messaging, real seller contact or government/VIN integration. Missing history is labeled unavailable, never verified or accident-free. Do not accept real personal documents or publish real seller data until the backend and privacy workflow exist.

## Verification
- 24 browser interaction assertions passed in local Chromium: filters, drafts, URL state, sorting, favorites, comparison cap/removal, dialogs, keyboard tabs, contact demo and empty/unavailable states.
- Public layouts checked at 320, 360, 375, 390, 430, 600, 768, 1024 and 1440 px; no body horizontal overflow.
- Offline browser QA used React 19.1.1 and photo fixtures from the supplied design concepts because this execution environment cannot load remote pages. Fixtures and the offline QA runtime are not deployed. Actual deployment uses the existing dataset and its image URLs.
- Run logic regression tests after installing dependencies: `node --test tests/marketplace.test.mjs`.
- The existing GitHub Actions workflow runs TypeScript checking, Vite production build and GitHub Pages deployment.

## Main files
- `src/main.tsx`: React entry point.
- `src/marketplace.tsx`: public UI, routes, shared dialogs and theme.
- `src/marketplace-core.ts`: pure filtering, URL and storage helpers.
- `src/marketplace.css`: theme tokens, layouts and mobile behavior.
- `src/dashboard.tsx`, `src/data.ts`, `src/storage.ts`: existing functionality retained.

Remaining production work: authentication and permissions, server-side persistence, seller contacts and inquiry delivery, photo uploads/CDN, moderation, data-source agreements and verified vehicle-history integration.
