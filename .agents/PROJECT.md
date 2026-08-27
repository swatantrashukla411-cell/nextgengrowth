# Project: NextGenGrowth Brand Landing Page Responsive Optimization

## Architecture
- Frontend: `public/for-brands.html` is a static HTML landing page with styling defined inside `<style>` tags.
- Backend: `server.js` is an Express server serving public static files, handling requests on port 3000 (default or as configured).
- Styling: Responsive design using CSS variables, media queries, flexbox/grid layout, and styling logic.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | E2E Testing Track | Develop test infra and opaque-box test suite for mobile responsiveness & cross-browser styling (Tiers 1-4). Outputs `TEST_READY.md`. | None | IN_PROGRESS | a2abebd5-117c-4e27-91f5-996f597bd59b |
| 2 | Implementation Track | Fix responsive navigation layout, CTAs, action buttons, verify against E2E tests, and perform Tier 5 adversarial coverage hardening. | M1 | IN_PROGRESS | ac137e28-95ad-4a60-9276-3dee5c3f5bdf |

## Interface Contracts
### `public/for-brands.html` Page Interactivity
- Viewports: 320px to 1440px width.
- Elements & selectors of interest:
  - Header: `header`
  - "Post a Project" CTA: selector to be identified by Explorer/Worker (e.g. `.cta-btn`, `#post-project-btn`, etc.)
  - "Client Login" CTA: selector to be identified by Explorer/Worker
  - Mobile Menu Toggle: burger/menu button to toggle drawer
  - Mobile Navigation Drawer: menu panel that opens on mobile viewport size (<768px)
- Touch Targets: Interactive links and buttons on mobile must have >= 44x44px target area.
- Layout limits: No horizontal scrollbars on any viewport size from 320px to 1440px.

## Code Layout
- `public/for-brands.html` — The main brand landing page
- `server.js` — Node/Express application server
- `package.json` — Dependency details
