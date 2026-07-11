# Demand Setu — Website Project Handoff Document

**Project:** Demand Setu Travel & Stays Website  
**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Redux Toolkit  
**Backend API:** `https://packagemakerbackend.demandsetutours.com`  
**Last updated:** June 2026

---

## 1. Executive Summary

This is a full-stack **hotel & homestay booking website** for Demand Setu Tours. Users can search stays by city/state, browse listings, view property details with live inventory pricing, select rooms (including multi-category combos), checkout, pay via Razorpay, and manage bookings. The site supports both **live API hotels** (Packagemaker) and **static demo listings** for development/fallback.

**Primary user journey:**  
Home → Search → Listings → Property → Room Selection → Checkout → Payment → My Bookings

---

## 2. Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 16.2.6 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| State | Redux (location catalog), React Context (room selection, booking gate) |
| Session | `sessionStorage` / `localStorage` for trip search, room selection, guest auth |
| Payments | Razorpay (via backend `api/razorpay-demand/*`) |
| Email | Backend `api/webmail/send-demand` |
| WhatsApp | Backend `api/whatsapp/send-template` |
| Fonts | Plus Jakarta Sans |

**Note:** No `.env` files are used today — API base URL and support contacts are hardcoded in `src/lib/apiConfig.js` and related libs.

---

## 3. Site Map & Routes

### SEO-friendly routes (canonical)

| URL Pattern | Page | File |
|-------------|------|------|
| `/` | Home | `src/app/page.js` |
| `/hotels/manali` | Listings (category + location) | `src/app/[category]/[location]/page.js` |
| `/hotels/manali/grand-himalayan-resort` | Property detail | `src/app/[category]/[location]/[property]/page.js` |
| `/hotels/manali/grand-himalayan-resort/book` | Checkout | `src/app/[category]/[location]/[property]/book/page.js` |

**Category URL segments:** `stays`, `hotels`, `airbnb`, `villas` / `homestay`  
**Query params:** `checkIn`, `checkOut`, `adults`, `children`, `rooms`, `childAges`, filters (`price`, `stars`, `amenities`, `sort`)

### Legacy redirects (preserve query string)

| Old URL | Redirects to |
|---------|--------------|
| `/listings?...` | SEO slug listings URL |
| `/property/[slug]` | SEO property URL |
| `/property/[slug]/book` | SEO book URL |

### Auth & account

| URL | Purpose |
|-----|---------|
| `/signin` | Guest login (mobile + password) |
| `/signup` | Redirects to `/signin` |
| `/my-bookings` | View bookings, pay pending, resend email |
| `/admin/properties` | Stub (placeholder only) |

---

## 4. Page-by-Page Features

### 4.1 Home Page (`/`)

- **Hero search bar** — city/state, dates, guests & rooms → navigates to listings
- **Booking gate** — property cards require search dates before opening property page
- **Category showcase** — Hotels, Airbnb, Villas with explore modal
- **Destination states** — browse Himachal and other states
- **API-driven sections** — Guest Favourites, Popular This Week (from Packagemaker API, Himachal Pradesh default)
- **Static fallback** — mock listings when API unavailable
- **Trust sections** — testimonials, marquee, promo CTAs

**Key files:** `src/app/page.js`, `src/components/SearchBar.js`, `src/components/BookingGateProvider.js`, `src/lib/homePageListings.js`

---

### 4.2 Listings Page (`/[category]/[location]`)

- **Hero search** — edit trip (location, dates, guests) inline
- **Category pills** — filter by stay type
- **API listings** — live hotels when city/state in URL (`ApiListingsResults`)
- **Static listings** — mock data when no location filter
- **Filters** — price range, star rating, amenities, sort
- **SEO content** — CMS-driven blocks (about, FAQ, highlights, schema JSON-LD)
- **Trip hydrator** — syncs session search to URL

**Key files:** `src/app/listings/ListingsPageView.js`, `src/components/listings/*`, `src/lib/seoListingApi.js`, `src/components/listings/ListingsSeoContent.js`

---

### 4.3 Property / Product Page (`/[category]/[location]/[property]`)

- **Gallery** — image carousel with lightbox
- **Breadcrumb & nav tabs** — Overview, Rooms, About, Location, Reviews
- **Room selection (inventory)** — meal plans EP / CP / MAP / AP with live B2C rates
- **Multi-room pricing** — GST 5%, extra adult charges, per-night breakdown
- **Room combo mode** — when one category cannot fulfil search room count, auto-suggest combo across categories (e.g. 5× Deluxe + 1× Super Deluxe)
- **Customize your room** — per-room guest assignment across categories; combo and customize are **mutually exclusive** (switching clears the other on Confirm / combo select)
- **Booking card (sidebar)** — sticky price summary + Reserve CTA
- **Mobile booking bar** — fixed bottom bar on mobile
- **Header search** — compact search bar on property pages
- **Policies & amenities** — from API or static data
- **Similar hotels** — static listings only

**Key files:** `src/app/property/PropertyPageView.js`, `src/components/property/*`, `src/contexts/PropertyRoomSelectionContext.jsx`, `src/lib/propertyInventory.js`

---

### 4.4 Checkout Page (`/book`)

- **Guest details form** — name, email, mobile, special requests
- **Price breakdown** — line items from room selection or standard nightly rate
- **Payment options:**
  - **Pay now** — Razorpay online payment
  - **Pay at property** — booking saved without charge
- **Member sign-in discount** — 10% when opted in at checkout
- **Inventory vs standard** — inventory bookings use saved room line items; standard uses `price` query param
- **Post-booking** — confirmation email + WhatsApp notification

**Key files:** `src/app/[category]/[location]/[property]/book/page.js`, `src/components/booking/BookingCheckoutForm.js`, `src/lib/checkoutPayload.js`

---

### 4.5 My Bookings (`/my-bookings`)

- Guest login required (mobile + password)
- List bookings from API by mobile number
- **Pay now** for pending / partially paid bookings (Razorpay)
- Resend confirmation email
- Payment WhatsApp trigger

**Key files:** `src/app/my-bookings/page.js`, `src/components/booking/MyBookingsClient.js`

---

### 4.6 Sign In (`/signin`)

- Guest login via `api/inventorybooking/guest-login`
- Session: `sessionStorage` (session) or `localStorage` (keep signed in)
- New guests can set password at checkout (sent in confirmation email)

---

## 5. Booking Flow (End-to-End)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐     ┌─────────────┐
│ Home/Search │ ──► │   Listings   │ ──► │  Property   │ ──► │ Checkout │ ──► │ My Bookings │
│  dates +    │     │  API/static  │     │ room select │     │ payment  │     │  manage     │
│  guests     │     │  + filters   │     │ combo/custom│     │ email/WA │     │             │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘     └─────────────┘
```

1. User sets **city/state**, **check-in/out**, **guests & rooms** on home or listings hero
2. Trip saved to **sessionStorage** (`demand_setu_booking`) and reflected in URL
3. Listings show matching hotels (API or static)
4. Property page loads hotel detail + **inventory B2C** rates per room category
5. User selects rooms → saved to **sessionStorage** (`demand_setu_room_selection`)
6. **Reserve** → navigates to `/book` with pricing query params
7. Checkout creates booking via `POST api/inventorybooking/create`
8. Optional Razorpay payment → verify → update booking status
9. Confirmation **email** + **WhatsApp** sent
10. Guest manages bookings at `/my-bookings`

---

## 6. Room Selection & Inventory Logic

### Meal plans
| Code | Label |
|------|-------|
| EP | Room Only |
| CP | Room with Breakfast |
| MAP | Breakfast + Lunch/Dinner |
| AP | All Meals |

### Modes

| Mode | When | Behaviour |
|------|------|-----------|
| **Single category** | Search rooms ≤ category availability | Pick room count per meal plan in one category |
| **Combo** | Search rooms > one category's availability | Auto-allocate across categories (e.g. 5 Deluxe + 1 Super Deluxe) |
| **Customize** | Combo scenario active | User picks each room slot with adults/child per room |

### Business rules implemented

- **Max 3 guests per room**; child ≤7 counts as young child; child >7 counts as adult
- **Max 9 rooms** bookable online (`MAX_SELF_SERVICE_SEARCH_ROOMS`); **10+ rooms** → bulk enquiry form (mailto to `info@demandsetutours.com`)
- **Bulk enquiry triggers:** guest picker above 9 rooms; property page Confirm when total would exceed 9
- **Combo vs customize:** mutually exclusive — selecting combo clears customize; customize Proceed clears combo
- **Combo "Confirmed" UI:** only shown on the **primary** category (highest room count), not secondary filler categories
- **Guest sync:** room selection updates URL guest params when selection changes

### Key libraries
- `src/lib/propertyInventory.js` — pricing, availability, combo allocation, line items
- `src/lib/guestOccupancy.js` — occupancy rules, min rooms, child ages
- `src/contexts/PropertyRoomSelectionContext.jsx` — selection state provider
- `src/lib/propertyBookingSave.js` — save selection + navigate to book
- `src/lib/roomSelectionStorage.js` — session persistence

---

## 7. API Integrations

**Base URL:** `https://packagemakerbackend.demandsetutours.com` (`src/lib/apiConfig.js`)

### Hotels (Packagemaker)
| Endpoint | Use |
|----------|-----|
| `GET .../get-packagemaker-hotels-by-state/:state` | Home, state listings |
| `GET .../get-packagemaker-hotels-by-city-pi/:city` | City listings |
| `GET .../get-packagemaker-by-id/:id` | Single property |
| `GET .../get-packagemaker-hotel-cities` | Location autocomplete |
| `GET .../get-packagemaker-hotel-states` | State list |

### Inventory booking
| Endpoint | Use |
|----------|-----|
| `POST api/inventorybooking/create` | Create booking at checkout |
| `POST api/inventorybooking/guest-login` | Guest sign-in |
| `GET api/inventorybooking/get-by-mobile/:mobile` | My bookings |

### Payment (Razorpay)
| Endpoint | Use |
|----------|-----|
| `POST api/razorpay-demand/order` | Create payment order |
| `POST api/razorpay-demand/verify` | Verify payment signature |

### Notifications
| Endpoint | Use |
|----------|-----|
| `POST api/webmail/send-demand` | Booking confirmation email |
| `POST api/whatsapp/send-template` | Booking welcome + payment confirm |

### SEO CMS
| Endpoint | Use |
|----------|-----|
| `GET api/seo-listing/:category/:locationType/:location` | Listings page SEO content |

---

## 8. Email & Notifications

### Booking confirmation email
- **Built in JS** (`src/lib/bookingEmail.js`) — HTML + plain text templates
- Includes: property name, stay dates, room breakdown, guest details, payment summary (total / paid / due)
- Subjects:
  - Paid online: `Payment Received · Booking Confirmed · {property}`
  - Pay at property: `Booking Confirmed · {property}`
- Support contact in footer: `+91 8353056000`, `info@demandsetutours.com`

### WhatsApp templates
- `website_static_template` — booking welcome
- `payment_confirm` — payment confirmation

### Bulk stay enquiry
- **No API** — opens `mailto:info@demandsetutours.com` with prefilled body
- Component: `src/components/booking/BulkStayEnquiryForm.jsx`

---

## 9. Payment Flow

1. User chooses **Pay now** or **Pay at property** at checkout
2. **Pay now:** `createDemandOrder` → Razorpay checkout modal → `verifyDemandPayment`
3. Currency: **INR**; theme: brand orange `#ea580c`
4. **GST:** 5% on subtotal
5. **Member discount:** 10% when member sign-in checked at checkout
6. **My Bookings:** pending bookings can be paid later via same Razorpay flow
7. Footer shows payment method logos (`PaymentLogos.js`)

---

## 10. SEO

### Listings SEO (`ListingsSeoContent.js`)
- CMS-driven: heading, about destination, highlights, best time to visit, how to reach, travel tips, FAQ accordion, tags, images
- HTML sanitized via `prepareSeoHtml`

### Structured data (`ListingsSeoSchema.js`)
- `FAQPage` schema when FAQs enabled
- `TouristDestination` (or custom `schemaType`) when page schema enabled

### Metadata
- Dynamic `generateMetadata` on listings and property pages
- Property: title `{Hotel Name} | Demand Setu`

---

## 11. State & Session Storage

| Key | Storage | Contents |
|-----|---------|----------|
| `demand_setu_booking` | sessionStorage | Trip: category, city, state, dates, guests |
| `demand_setu_room_selection` | sessionStorage | Property room line items, pricing, dates |
| `demand_setu_guest_session` | sessionStorage | Guest auth (session) |
| `demand_setu_guest_persistent` | localStorage | Guest auth (keep signed in) |

**Custom event:** `demand-setu-trip-search-updated` — syncs trip across components (`useTripSearch` hook)

---

## 12. Guest Occupancy Rules

| Rule | Value |
|------|-------|
| Max guests per room | 3 |
| Max young children (≤7) per room | 1 |
| Child >7 years | Counts as adult |
| Max rooms in picker | 30 |
| Max self-service online | **9** (10+ → bulk enquiry) |
| Default child age | 5 |

---

## 13. Scripts & Templates (Non-App)

| File | Purpose |
|------|---------|
| `scripts/proposal-template.html` | Standalone A4 printable travel proposal template (~1500 lines) — e.g. Spiti Valley itinerary, pricing, terms |
| `Spiti_Valley_Travel_Proposal.pdf` | Sample generated proposal PDF |

These are **not wired into the Next.js app** — sales/reference assets.

---

## 14. Component Architecture (High Level)

```
layout.js
├── Header (nav, explore modal, property search)
├── main
│   └── [page content]
├── Footer (links, payment logos)
└── MobileNav

Property page:
PropertyPageView
├── PropertyTripHydrator
├── PropertyGallery
└── PropertyBookingShell
    └── PropertyRoomSelectionProvider
        ├── PropertyRooms (meal plans, combo, customize)
        ├── PropertyBookingCard (sidebar)
        └── PropertyMobileBar (mobile CTA)
```

---

## 15. Recent Fixes & Improvements (This Sprint)

| Area | Fix |
|------|-----|
| **React console error** | `PropertyRoomSelectionProvider` was calling `persistTripSearch` inside `setState` updaters during render, updating `HeaderSearchBarClient`. Moved guest sync to `useEffect`; deferred trip update events via `queueMicrotask`. |
| **Combo + customize conflict** | Both could stack (10+ rooms, unreducible). Made mutually exclusive: combo select clears customize; customize Proceed clears combo. |
| **Wrong combo "Confirmed" on wrong category** | Deluxe showed confirmed when Family combo was selected. Fixed `isComboActiveForPrimary` to use **highest room-count category** as primary, not list order. |
| **10+ rooms across categories** | User could confirm 5 rooms in category A + 5 in category B = 10 total. On Confirm, if total > 9 → **BulkStayEnquiryForm** opens; selection not saved. |

---

## 16. Known Limitations & Future Work

- **No environment variables** — API URL and contacts are hardcoded; recommend `NEXT_PUBLIC_API_BASE_URL` for staging/production
- **`/signup`** redirects to signin — no separate registration flow
- **`/admin/properties`** is a stub — no property CRUD in frontend
- **Search analytics** — console logging only, no analytics SDK
- **Dual data sources** — static mock listings + live API; resolution logic in `src/lib/propertyData.js`
- **Some API paths** use double slash (`api/packagemaker//get-...`) — matches deployed backend

---

## 17. How to Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # production server
```

**Image domains** configured in `next.config.mjs` for Unsplash, Pexels, Firebase, Google, demandsetutours.com.

---

## 18. Key File Index

| Area | Path |
|------|------|
| Home | `src/app/page.js` |
| Listings view | `src/app/listings/ListingsPageView.js` |
| Property view | `src/app/property/PropertyPageView.js` |
| Checkout | `src/app/[category]/[location]/[property]/book/page.js` |
| Trip / URL search | `src/lib/bookingSearch.js` |
| Inventory & pricing | `src/lib/propertyInventory.js` |
| Room selection context | `src/contexts/PropertyRoomSelectionContext.jsx` |
| Checkout form | `src/components/booking/BookingCheckoutForm.js` |
| Razorpay | `src/lib/razorpayDemandApi.js` |
| Email templates | `src/lib/bookingEmail.js` |
| WhatsApp | `src/lib/whatsappApi.js` |
| SEO API | `src/lib/seoListingApi.js` |
| Hotel API | `src/lib/hotelListingsApi.js` |
| Booking API | `src/lib/inventoryBookingApi.js` |
| Guest rules | `src/lib/guestOccupancy.js` |
| Bulk enquiry | `src/components/booking/BulkStayEnquiryForm.jsx` |

---

## 19. Support & Brand Contacts (Hardcoded)

- **Email:** info@demandsetutours.com  
- **Phone:** +91 8353056000  
- **Brand color:** Orange (`#ea580c` / `brand` in Tailwind)

---

*Document prepared for internal handoff. For questions on booking logic or API contracts, refer to backend team at Packagemaker / Demand Setu backend.*
