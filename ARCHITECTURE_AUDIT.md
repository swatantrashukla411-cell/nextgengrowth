# NextGenGrowth architecture audit

## Current architecture

- The Express application still starts in `server.js`. Root pages and legacy dashboards are served from `public/`; the Vite React app is served under `/app`.
- Authentication, student, brand, payment, admin, coupon, and marketplace handlers now register from `src/routes/`. Coupon logic uses `src/controllers/coupon.controller.js`; authentication middleware is centralized in `src/middleware/auth.js`.
- Most legacy Mongoose schemas and shared business helpers remain in `server.js`. The broader model/service/controller structure exists, but schema and helper migration is not complete. Existing model names and coupon/store field shapes are preserved.
- React routes for student jobs, applications, and brand project posting point to complete views. Legacy public pages remain the production default while React is available at `/app`.

## Changes made

- Admin-only coupon APIs and coupon dashboard/print pages require a valid admin JWT. Legacy `.html` paths are intercepted before static serving. Admin login is rate limited, removes embedded credential defaults, and issues an HTTP-only same-site cookie while preserving its bearer-token response.
- Production startup fails when `JWT_SECRET` is missing. Development uses a process-random secret instead of a fixed fallback. Express sessions use `connect-mongo`.
- Removed automatic sample-store and `BW000001` insertion on database connection. Coupon data must be created deliberately through protected admin actions.
- Public `/api/health` now returns only a generic success indicator and status.
- Outreach CSV/XLSX exports are ignored by Git. Static serving is rooted at `public/`; repository-root outreach files have no Express static route.
- Static landing canonical and Open Graph URLs use `https://nextgengrowth.in`. Organization `sameAs` contains the confirmed LinkedIn company profile; no other official social profile was confirmed.
- Payment verification uses HMAC SHA-256 with a constant-time comparison. No inbound Razorpay webhook handler exists.

## Remaining work

1. Move residual schemas and shared business helpers out of `server.js` into models, services, and controllers while keeping MongoDB collection names and response contracts stable.
2. Add an inbound Razorpay webhook only after the signing secret, enabled events, idempotency storage, and retry rules are configured.
3. Continue React parity for workspaces, payouts, KYC/profile, brand applications, and long-term hiring, then migrate production routes in stages.
4. Add automated coverage for admin-cookie login and authorized coupon actions against a test database.

## Validation

- `node --check server.js` and syntax checks across `src/**/*.js` passed after extraction.
- `npm run test:unit`: 10 passed, including email provider behavior and valid/invalid Razorpay signatures.
- `npm --prefix client run build`: passed; Vite reports the main JavaScript chunk is over 500 kB.
- `npm run test:e2e`: 12 passed. Browser-driven cases could not launch because Chromium, Firefox, and WebKit Playwright binaries are not installed.
- After route extraction, 4 targeted Playwright request-level security checks passed. Local HTTP smoke checks also confirmed anonymous redirects, admin-cookie access, and 404s for outreach files.