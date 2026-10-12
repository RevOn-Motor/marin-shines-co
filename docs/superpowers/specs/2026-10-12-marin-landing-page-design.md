# Marin County House Cleaning Landing Page: Design Spec

Date: 2026-10-12
Status: approved (2026-10-12)
Branch: `worktree-landing+marin-launch` (worktree `.claude/worktrees/landing+marin-launch`)

## 1. Brief

| Field | Value |
|---|---|
| Brand | **Marin Shine Co.** Tagline: "A Higher Standard of Clean." |
| Product/Service | Residential house cleaning in Marin County, CA: standard, deep, move-in/move-out, vacation rental turnover |
| Offer | Free add-on with the first clean. Working copy: "free inside-oven or inside-fridge clean" **(placeholder, owner to confirm)** |
| Value proposition | A spotless home without giving up your weekend, from a local Marin team, with a free quote in under a minute |
| Target audience | Busy Marin households (dual-income families, professionals, older homeowners) and Airbnb/VRBO hosts |
| Awareness | Solution-aware: they searched for a cleaner and are comparing providers |
| Key pain point | No time; weekends lost to chores; the house isn't ready when guests come |
| Key benefit | Weekends back; come home to a clean house |
| Lead destination | Google Sheet row (Apps Script webhook) **and** email to owner (Resend) |
| Traffic source | Google search, organic + ads. Keyword: "house cleaning Marin County" (plus town variants). No ad copy yet |
| Design style | Custom: "fog lifting over Mt. Tam" (section 4) |
| Copy framework | PAS, light on agitation, heavy on trust |

### Assumptions (non-blocking; owner may correct)

- The business is not yet operating: no reviews, photos, prices, license/insurance status, or owner bio exist. Every such fact is a marked placeholder (section 8).
- Placeholder phone `(415) 555-0123` (555-01xx is reserved for fiction), email `hello@example.com`, domain `https://www.example.com`.
- Service area: Belvedere, Corte Madera, Fairfax, Greenbrae, Kentfield, Larkspur, Mill Valley, Novato, Ross, San Anselmo, San Rafael, Sausalito, Tiburon.
- Primary conversion = quote form submission. Secondary conversion = tap-to-call/text (kept because the source guide says never hide contact info).

## 2. Page structure

Single route `/`. No navigation links. The page maps the source guide's 8 elements as follows:

| # | Section | Guide element | Content |
|---|---|---|---|
| 0 | Slim header | Contact info | "Marin Shine Co." wordmark in Bitter, with the tagline "A Higher Standard of Clean." beside it on desktop (left). Phone link "Call or text (415) 555-0123" (right); on mobile it becomes a compact "Call" button. |
| 1 | Hero | Hero | H1, subhead with offer, 2-step quote form (step 1 visible), "Free quote. No commitment." under the button, trust badge row, Mt. Tam ridge line along the bottom edge. |
| 2 | Problem → solution | Problem/solution | Heading + three pain lines + solution paragraph. |
| 3 | Services | Service listing | Four price-list rows: name, one-line explanation, 3–4 included items, "from $__", "Get a quote" button that pre-selects the service. |
| 4 | How it works | Quoting process | Three numbered steps. |
| 5 | Proof + owner | Social proof, About | Google rating, testimonials, before/after: **each hidden while its config is empty**. "Meet the owner" block with photo, name and short note. |
| 6 | FAQ | Objections | 8 Q&As via native `<details>`. Source for FAQPage JSON-LD. |
| 7 | Final CTA | Booking/contact | Dark Canopy band, restated offer, full 2-step form (second instance), call/text line. |
| 8 | Service area + footer | SEO | "Serving all of Marin County", 13 towns, lazy Google Maps iframe of Marin County, then footer: "Marin Shine Co." + tagline, phone, email, service area, Privacy link. |
| — | Mobile sticky bar | Repeated CTAs | Below 768px, after the hero form scrolls out of view: "Get my quote" (Poppy) + "Call". Hidden while either form is in view. |

### Draft copy

**H1:** House Cleaning in Marin County

**Subhead:** Come home to a spotless house without giving up your weekend. Your first clean includes a free inside-oven or inside-fridge clean.

**Below hero button:** Free quote. No commitment.

**Trust badges (all placeholders):** Bonded & insured · Background-checked cleaners · Locally owned in Marin. Each one renders only if the owner keeps it in config.

**Problem heading:** Your house shouldn't take your whole weekend
- Saturday disappears into scrubbing, vacuuming, and laundry.
- You clean on Sunday, and by Wednesday it's a mess again.
- Guests are on their way and the house isn't ready.

**Solution:** We handle the cleaning so you don't have to. Our team shows up when we say we will, brings everything we need, and leaves your home spotless, so your weekends are for the trails on Mt. Tam, not the mop bucket.

**Services**
1. *Standard cleaning.* Regular upkeep for a home that's already in good shape, weekly, every other week, or monthly. Includes: dusting reachable surfaces; kitchen counters, sink, and stovetop; bathrooms scrubbed and sanitized; vacuuming and mopping every floor.
2. *Deep cleaning.* A top-to-bottom reset for homes that haven't had a professional clean in a while, or before a recurring plan starts. Includes: everything in a standard clean; baseboards, door frames, and light switches; cabinet fronts and appliance exteriors; built-up grime in showers and tubs.
3. *Move-in / move-out cleaning.* An empty-home clean so you get your deposit back or start fresh in your new place. Includes: inside cabinets, drawers, and closets; inside the oven and fridge; walls spot-cleaned; every floor and fixture.
4. *Vacation rental turnover.* Reliable turnovers between guests for Airbnb and VRBO hosts. Includes: fresh linens and beds made; kitchen and bathrooms guest-ready; trash out and surfaces wiped; scheduled around your check-out times.

Each row shows "from $__" (placeholder price).

**How it works**
1. Request your quote. Tell us about your home in under a minute.
2. Pick your date. We'll confirm your price and find a time that works.
3. Relax. Come home to a clean house.

**Meet the owner (placeholder):** "Hi, I'm [Owner name]. I started Marin Shine Co. because …" (2–3 sentences, owner-supplied). Photo slot shows initials on a Eucalyptus block until a real photo exists.

**FAQ (answers stating policy are drafts for the owner to confirm)**
1. Do I need to be home during the cleaning? No. Many clients leave a key, a lockbox code, or a garage code. Whatever works for you.
2. Do you bring your own supplies? Yes, we bring all supplies and equipment. If you'd rather we use your products, just let us know. *(policy)*
3. How is the price determined? It depends on your home's size, the type of cleaning, and how often you'd like us to come. Request a quote and we'll send you an exact price.
4. Are you insured? Yes. We're bonded and insured, and every cleaner is background-checked. *(fact)*
5. What if I'm not happy with the clean? Tell us within 24 hours and we'll come back and re-clean those areas for free. *(guarantee)*
6. Do I have to sign a contract? No. Book a single clean or a recurring plan, and change or cancel anytime. *(policy)*
7. Which towns do you serve? All of Marin County: {towns, generated from config}.
8. Is the free add-on really free? Yes. Your first clean includes a free inside-oven or inside-fridge clean. *(offer)*

**Final CTA heading:** Get your free quote
**Final CTA body:** Tell us about your home and we'll send your price. Your first clean includes a free inside-oven or inside-fridge clean.
**Under form:** Free quote. No commitment. Or call or text (415) 555-0123.

**Service area heading:** Serving all of Marin County

## 3. The 2-step quote form

One client component, `QuoteForm`, rendered twice (hero, final CTA). Each instance has independent state.

**Step 1: "Get your free quote" / "Step 1 of 2"**
- *What do you need?* Four radio tiles: Standard cleaning, Deep cleaning, Move-in or move-out, Vacation rental. Required.
- *Town:* select with the 13 towns + "Other Marin town". Required.
- *Bedrooms:* Studio, 1, 2, 3, 4, 5+. *Bathrooms:* 1, 1.5, 2, 2.5, 3, 3.5, 4+. Required, one row.
- Button: **Next: your details** (Poppy). Blocks until step 1 is valid and shows inline errors.

**Step 2: "Step 2 of 2", with a "Back" text button**
- Name (`autocomplete="name"`), Phone (`type="tel"`, `autocomplete="tel"`), Email (`type="email"`, `autocomplete="email"`). All required.
- "Anything we should know?" textarea, optional, max 1000 chars.
- Hidden honeypot input `company` (off-screen, `tabindex=-1`, `autocomplete="off"`, `aria-hidden`).
- Button: **Get my free quote**. Disabled with "Sending…" while pending (no double submit).
- Below: "We'll never share your info." + link to `/privacy`.

**Success:** form is replaced by "Quote request sent. We'll reach out within [2 business hours] with your price." (response time is a placeholder). Focus moves to this message. Google Ads lead conversion fires here, and only here.

**Error (both destinations failed / not configured in production):** "We couldn't send your request. Try again, or call or text (415) 555-0123." All typed values are kept. Field-level validation errors returned by the server show next to their fields.

**Validation messages:** Choose a service. · Choose your town. · Choose the number of bedrooms. · Choose the number of bathrooms. · Enter your name. · Enter a 10-digit phone number. · Enter an email like name@example.com.

**Mechanics:** all fields live inside one `<form noValidate>`; the same `validateLead` rules run on the client (per step) and on the server, so browser-native validation never fights hidden fields. Step 1 is hidden (not unmounted, not disabled) on step 2 so its values submit. Inputs are controlled so values survive a failed submit. Error messages are linked with `aria-describedby`; step changes move focus to the step heading. Step transition is a short slide, disabled under `prefers-reduced-motion`.

**Service pre-selection:** each "Get a quote" button in Services is a `QuoteLink` (client). On click it dispatches a `quote:select` event with the service id and scrolls the nearest form into view; both forms listen and set step 1's service. Without JS the link is a plain `href="#quote"` to the hero form.

## 4. Visual design

**Concept:** "the fog lifts over Mt. Tam." Cool, airy, local. Avoids the cleaning-industry defaults (sparkles, bubbles, corporate blue) and the generated-page defaults (warm cream + clay accent, SaaS card grids, all-caps eyebrow labels, middle-dot meta strings, "→" on buttons).

**Signature element:** a single-stroke inline SVG of Mt. Tamalpais's ridge ("the Sleeping Lady") in Eucalyptus across the bottom of the hero. It is the only decorative flourish on the page. Reused in the OG image.

**Tokens** (defined with `@theme` in `globals.css`; light theme only; the page sets its own background so OS dark mode doesn't invert it):

| Token | Hex | Use |
|---|---|---|
| fog | `#EDF1EF` | Page background |
| paper | `#FFFFFF` | Form cards, inputs |
| canopy | `#1E3D32` | Headings, dark band, footer, text on Poppy |
| ink | `#24302B` | Body text |
| eucalyptus | `#8FAE9C` | Ridge line, rules, step numerals, owner-photo placeholder |
| poppy | `#F5821F` | CTA buttons and sticky bar only, always with canopy text (≈4.6:1) |

The canopy band uses fog-colored text. All text pairs meet WCAG AA.

**Type:** `Bitter` (variable, slab serif) for headings, the wordmark and step numerals, evoking Marin trailhead signage. `Atkinson Hyperlegible Next` (variable) for body and form. Both via `next/font/google`, latin subset, `display: swap`. Body ≥17px; H1 clamp ≈ 2.25rem (mobile) → 4rem (desktop); measure ≤ 70ch. Sentence case everywhere.

**Layout:** left-aligned throughout. Desktop hero is a split: text left, form card right. Mobile: header → H1 → short subhead → step 1 (compact: service tiles 2×2, town full width, bedrooms + bathrooms on one row) → Next button. Services are price-list rows separated by eucalyptus rules, not a card grid. Radius: inputs 10px, buttons 12px, form card 16px. Icons only where they carry information (phone, check marks on "includes" lists).

**Motion:** only in response to the visitor (step slide, sticky bar slide-up). No scroll-reveal. All motion off under `prefers-reduced-motion`.

## 5. Architecture

```
src/
  app/
    layout.tsx            fonts, metadataBase, conditional Google Ads gtag (next/script)
    page.tsx              composes sections; renders LocalBusiness + FAQPage JSON-LD; exports metadata
    globals.css           Tailwind import + @theme tokens
    opengraph-image.tsx   1200×630 ImageResponse: "Marin Shine Co.", H1, tagline, ridge line
    robots.ts, sitemap.ts
    privacy/page.tsx      draft privacy policy (owner/legal review)
    actions/request-quote.ts   'use server' → requestQuote(prevState, formData)
  components/             site-header, hero, ridge-line, quote-form/*, quote-link,
                          problem, services, how-it-works, proof, faq, final-cta,
                          service-area, site-footer, sticky-cta, phone-link
  content/site.ts         single source for all business facts and copy
  lib/
    lead.ts               Lead type, SERVICES/TOWNS/BEDROOMS/BATHROOMS enums,
                          parseLeadForm(formData) → validateLead(input) → {ok, lead} | {ok:false, fieldErrors}
    deliver-lead.ts       deliverLead(lead, {env, fetch, log}) → {ok: boolean}
    destinations/sheet.ts   appendToSheet(lead, cfg, fetch)
    destinations/resend.ts  emailLead(lead, cfg, fetch)
    structured-data.ts    localBusinessJsonLd(site), faqJsonLd(faqs), serializeJsonLd (escapes "<")
    tracking.ts           trackLeadConversion(), trackPhoneClick(); no-op without IDs
docs/
  lead-setup.md           Resend + Apps Script + Ads setup, step by step
  google-apps-script.gs   doPost: verify secret → appendRow
scripts/launch-check.mjs  lists `LAUNCH-BLOCKER` markers in src/, exits 1 if any remain
.env.example
vitest.config.mts
```

Units are pure where it matters: `validateLead`, `deliverLead`, the destination adapters and the JSON-LD builders take their dependencies (env, fetch, logger) as arguments, so tests need no network or module mocking. `request-quote.ts` is a thin wrapper that reads `process.env` and calls them.

The page has no request-time data, so it prerenders fully static under `cacheComponents`. Client components: `QuoteForm`, `QuoteLink`, `StickyCta`, `PhoneLink`.

### Lead data flow

```
QuoteForm ─(useActionState)→ requestQuote(prev, formData)
  parseLeadForm → validateLead
    invalid → {status:'error', fieldErrors, values}
    honeypot filled → {status:'success'}  (nothing delivered)
  deliverLead(lead):
    destinations = configured adapters (sheet if URL+secret, resend if key+to+from)
    none configured: dev → log lead, ok:true; production → log error, ok:false
    Promise.allSettled(destinations) → ok if ≥1 fulfilled with a 2xx response; log each failure
  ok → {status:'success'}   else → {status:'error', values}
```

**Sheet payload** (JSON POST to `LEADS_SHEET_WEBHOOK_URL`): `{secret, submittedAt, service, town, bedrooms, bathrooms, name, phone, email, notes, source}` (`source` = id of the form used: `quote` or `final-quote`). The Apps Script rejects a wrong secret and appends one row in that column order.

**Resend payload** (`POST https://api.resend.com/emails`, `Authorization: Bearer RESEND_API_KEY`): `from=LEAD_EMAIL_FROM`, `to=LEAD_EMAIL_TO`, `reply_to=lead.email`, subject `New quote request: {service} in {town}`, plain-text body listing every field. User-supplied values are never interpolated into HTML.

**Env vars** (documented in `.env.example`): `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`, `LEADS_SHEET_WEBHOOK_URL`, `LEADS_SHEET_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO`, `NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO`.

## 6. SEO and performance

- `metadata`: title "House Cleaning in Marin County, CA | Marin Shine Co." (52 chars); description 150–160 chars, mentioning Marin County, at least two towns, the free quote and the offer; `alternates.canonical` "/"; `metadataBase` from `NEXT_PUBLIC_SITE_URL` (fallback to the configured domain); OG + Twitter cards using the generated image.
- Exactly one `<h1>`. Town names appear in body text, the FAQ and the footer.
- JSON-LD: `LocalBusiness` (name, url, telephone, email, `areaServed` = City per town in Marin County, CA, `priceRange` placeholder; no street address, as a service-area business) and `FAQPage` built from the same `faqs` array the FAQ section renders. Serialized with `<` escaped. (Google limits FAQ rich results to a few site types; the markup is kept for search/AI understanding.)
- `robots.ts` allows all and points to `sitemap.ts`; sitemap lists `/` and `/privacy`.
- Map: `<iframe loading="lazy">` keyless Google Maps embed of "Marin County, CA" with explicit width/height (no CLS) and a `title`.
- Performance targets on a production build: LCP < 2.5s, CLS < 0.1, INP ≤ 200ms, total page weight < 1MB. No raster images above the fold; fonts self-hosted; gtag loads `afterInteractive` only when configured.

## 7. Testing (Vitest + React Testing Library + jsdom)

The plan's first task adds the runner (per `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`) and an `npm test` script. Each unit gets its tests written first.

- `validateLead`: each required field; phone accepts US formats and normalizes to 10 digits, rejects others; email format; service/town/bedrooms/bathrooms must be allowed values; notes length cap; honeypot flagged.
- `deliverLead`: both ok → ok; sheet fails + email ok → ok (failure logged); both fail → not ok; non-2xx counts as failure; none configured in production → not ok; none in development → ok + lead logged.
- Adapters: exact URL, headers and body sent to Resend and to the Sheet webhook; secret included; reply_to set.
- `QuoteForm`: Next blocked until step 1 is valid, with messages; Back keeps values; step 2 required-field messages; pending state disables the submit button; success renders the confirmation and calls `trackLeadConversion` once; error renders the phone fallback, keeps values and does not call tracking; `quote:select` pre-selects the service. The server action is injected as a prop so tests pass a fake.
- Structured data: FAQPage entries equal the rendered FAQ questions/answers; `serializeJsonLd` escapes `<`.
- Metadata: title 50–60 chars, description 150–160 chars, canonical set, OG image declared.
- CTA consistency: every quote CTA on the page targets `#quote` / the form; every phone link uses the same `tel:` number.

Verification (not unit tests): `npm run build`, `npm run lint`, `npm test`; screenshots at 375×667 and 1440×900 showing H1 and the step-1 Next button above the fold; production-build performance audit; one real end-to-end submission to a test Sheet + test inbox, confirmed by the owner.

## 8. Launch blockers (placeholders the owner must replace or remove)

1. Phone, email, domain (name is final: Marin Shine Co.; file a Fictitious Business Name statement with Marin County if operating under it as a sole proprietor/partnership)
2. The offer's exact add-on and any terms
3. Trust badges: bonded & insured, background-checked, locally owned (keep only what's true)
4. Starting prices for each service (or remove "from $")
5. Owner name, photo, and note
6. FAQ policy answers: supplies, insurance, re-clean guarantee, no-contract, add-on
7. Quote response time ("within 2 business hours")
8. Google rating / testimonials / before-after photos (sections stay hidden until supplied)
9. Real team photo (optional slot; hero works without it)
10. Privacy policy review
11. Env vars: Resend key + verified sending domain, Sheet webhook URL + secret, Google Ads IDs
12. Deployment (hosting, domain, HTTPS)

`npm run launch-check` must pass (zero `LAUNCH-BLOCKER` markers) before real traffic is sent.

## 9. Out of scope (follow-ups)

Per-town landing pages (`/house-cleaning/[town]`), Cloudflare Turnstile, online booking/payment, CMS, GA4/analytics beyond the Ads conversions, A/B testing infrastructure, real photography.

## 10. Acceptance criteria

- All 8 guide elements present, in the section order above, with no navigation links.
- The step-1 Next button is visible without scrolling at 375×667 and 1440×900.
- A valid submission reaches the Sheet and the inbox; with one destination down it still succeeds; with both down the visitor sees the phone fallback with values kept.
- The Ads lead conversion fires only on success.
- `npm run build`, `npm run lint`, `npm test` pass.
- Lighthouse-equivalent production metrics meet the section 6 targets.
- Every placeholder is tagged `LAUNCH-BLOCKER` and listed by `npm run launch-check`.
