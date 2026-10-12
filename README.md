# NexusStore

A fully responsive e-commerce platform built with **React 18** and **Vite**. It ships with a complete shopping experience — browsing, filtering, cart, coupons, a three-step checkout and a real card-validation payment engine — running entirely in the browser with state persisted to `localStorage`.

> This is a front-end demo. Authentication, orders and payments are simulated locally; no server or real charges are involved. The payment layer is written behind a clean service interface so it can be swapped for a live gateway (Stripe/PayPal) later.

---

## Features

### Storefront
- Home page with hero, category grid, featured/bestseller/new-arrival rails, flash-deal countdown, promo banners, testimonials and newsletter signup.
- Product catalog of 36 products across 7 categories, with real imagery (deterministic `picsum.photos` seeds — no API key required).
- Product detail page: image gallery, colour/size variants, quantity stepper, stock status, description/specs/reviews tabs, rating breakdown and related products.

### Shopping
- Advanced shop page: keyword search, category & tag filters, price slider, brand multi-select, rating filter, in-stock toggle, five sort modes, grid/list views, active-filter chips and pagination.
- Persistent cart with quantity editing, coupon codes and a live order summary (subtotal, discount, shipping, tax, total).
- Wishlist, toast notifications, dark/light theme, and a mobile drawer navigation.

### Checkout & Payments
- Three-step checkout (shipping → payment → review) with per-field validation.
- **Real card validation**: Luhn checksum, brand detection, per-brand length and CVC rules, and expiry checks.
- Live card-number formatting and brand badge, a processing overlay, decline handling both inline and via banner, and a 3D-Secure authentication step.
- Sandbox test cards for every outcome (see [Test cards](#test-cards)).

### Account
- Mock sign-in / registration (with password-strength meter), profile editing, order history with tracking view, saved wishlist and preference settings.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router 6 |
| State | React Context + `useReducer` |
| Styling | Hand-written CSS design system (CSS variables, dark mode, media queries) |
| Icons | Inline SVG components (no icon dependency) |
| Persistence | `localStorage` |

No UI kit or CSS framework is used, so there are no external runtime dependencies beyond React and React Router.

---

## Getting started

### Prerequisites
- Node.js 18 or newer (developed on Node 22)
- npm

### Install and run

```bash
npm install
npm run dev
```

Vite starts a dev server (default `http://localhost:5173`) and opens it in your browser.

### Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Project structure

```
ecommerce platform/
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx              # App bootstrap (Router + StoreProvider)
    ├── App.jsx               # Layout and route table
    ├── index.css             # Global design system and responsive rules
    ├── components/           # Reusable UI
    │   ├── Navbar.jsx        # Sticky header, search, categories, cart/wishlist badges
    │   ├── Footer.jsx        # Perks, link columns, newsletter, payment badges
    │   ├── ProductCard.jsx   # Grid/list product tile with quick add + wishlist
    │   ├── ProductRail.jsx   # Horizontally scrolling product carousel
    │   ├── Rating.jsx        # Star rating display
    │   ├── QuantityStepper.jsx
    │   ├── Toasts.jsx        # Toast notification stack
    │   ├── ScrollToTop.jsx
    │   └── Icons.jsx         # Inline SVG icon set
    ├── context/
    │   └── StoreContext.jsx  # Cart, wishlist, auth, orders, coupons, theme, toasts
    ├── data/
    │   └── products.js       # Catalog, categories, brands, helpers
    ├── payments/
    │   └── paymentService.js # Card validation + simulated gateway
    ├── pages/
    │   ├── Home.jsx
    │   ├── Shop.jsx
    │   ├── ProductDetail.jsx
    │   ├── Cart.jsx
    │   ├── Checkout.jsx
    │   ├── Wishlist.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Account.jsx
    │   ├── OrderSuccess.jsx
    │   ├── About.jsx
    │   └── NotFound.jsx
    └── utils/
        └── format.js         # Currency and date formatting
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/shop` | Product catalog (supports `?q=`, `?category=`, `?tag=`, `?sort=`, `?max=`, `?rating=`, `?brands=`, `?stock=`) |
| `/product/:slug` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/wishlist` | Wishlist |
| `/login`, `/register` | Authentication |
| `/account` | Account dashboard (supports `?tab=profile|orders|wishlist|settings`) |
| `/order-success/:id` | Order confirmation |
| `/about` | About and FAQ |
| `*` | 404 |

---

## Payment system

The payment engine lives in `src/payments/paymentService.js` and exposes two async functions:

```js
processPayment({ method, card, amount, currency }) // -> { status, ... }
confirmAction(paymentId, code)                     // -> { status, ... }
```

`status` is one of `succeeded`, `failed` or `requires_action`. The checkout UI calls only these functions, so replacing them with a live Stripe or PayPal implementation requires no component changes.

### Validation performed
- **Luhn checksum** and per-brand card-number length.
- **Brand detection** for Visa, Mastercard, American Express, Discover, JCB, Diners Club and UnionPay.
- **Expiry** parsing (MM/YY), month bounds and expiration check.
- **CVC length** per brand (4 digits for Amex, otherwise 3).

### Test cards

Sandbox mode. Use these numbers (any future expiry and matching CVC):

| Card number | Outcome |
|---|---|
| `4242 4242 4242 4242` | Succeeds (Visa) |
| `5555 5555 5555 4444` | Succeeds (Mastercard) |
| `3782 822463 10005` | Succeeds (Amex, CVC `1234`) |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |
| `4000 0000 0000 3220` | Requires 3D-Secure |

For the 3D-Secure challenge, the demo passcode is `123456`. Any other card that passes Luhn, expiry and CVC checks succeeds.

---

## Coupons

Applied in the cart. Predefined codes:

| Code | Effect |
|---|---|
| `WELCOME10` | 10% off the subtotal |
| `SAVE20` | $20 off the subtotal |

Shipping is free for orders over $100 after discount; a flat $9.99 applies otherwise. Tax is calculated at 8%.

---

## Theming and responsiveness

- All colours, radii and shadows are CSS variables in `:root`, with a full dark theme under `[data-theme="dark"]`. The navbar toggle switches modes and the choice is saved.
- Layout adapts across breakpoints at **1080px**, **900px**, **640px** and **420px** — collapsing navigation with a mobile drawer and search, stacked product/cart/checkout layouts, horizontal scroll rails, and touch-friendly controls.
- Respects `prefers-reduced-motion`.

---

## Data and persistence

State is held in `StoreContext` and saved to `localStorage` under `nexus-store-state-v1`. It includes the cart, wishlist, signed-in user, order history and theme. Clearing site data or running `localStorage.removeItem('nexus-store-state-v1')` in the console resets the app.

---

## Notes and next steps

- Authentication and payments are simulated; wire these to a backend for production use.
- Product data in `src/data/products.js` is static and can be replaced with an API call.
- `paymentService.js` is the single integration point for a real payment provider.

## License

Released for educational and demonstration purposes.
