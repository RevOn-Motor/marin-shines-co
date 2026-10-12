# Marin Shine Co. Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the create-next-app scaffold with a single, statically prerendered landing page for Marin Shine Co. (house cleaning, Marin County, CA). The page captures quote requests through a 2-step form and delivers each lead to a Google Sheet and to the owner's inbox.

**Architecture:**
- **Content:** one module holds every business fact and line of copy (`src/content/site.ts`).
- **Lead handling:** pure, dependency-injected modules (`src/lib/*`) validate and deliver leads. A thin Server Action (`src/app/actions/request-quote.ts`) wires them to `process.env`.
- **Page:** server components compose the page. The only client components are the quote form, the quote/phone links and the mobile sticky bar.
- **Tests:** everything that can lose a lead silently is unit-tested with Vitest.

**Tech Stack:** Next.js 16.4 (App Router, `cacheComponents`), React 19.3, TypeScript 5.9 (strict), Tailwind CSS 4.3 (`@theme` tokens, Turbopack loader), `next/font/google` (Bitter, Atkinson Hyperlegible Next), Vitest + React Testing Library + jsdom. Resend and Google Apps Script are called with `fetch`, so the app adds no runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-12-marin-landing-page-design.md`. Read it before starting any task. Where this plan refines a name or signature from the spec (e.g. `deliverLead` deps, the `source` field), the plan wins.

## Global Constraints

- Work only inside the worktree `/Users/mac/Desktop/cleaning-service/.claude/worktrees/landing+marin-launch` (branch `worktree-landing+marin-launch`). Commands below run from that directory.
- Next.js 16.4 differs from older versions: read the matching guide in `node_modules/next/dist/docs/` before using an API not shown in this plan.
- `cacheComponents: true`: the page must prerender fully static. No `cookies()`, `headers()`, `searchParams`, `Date.now()` or `new Date()` during render. (`new Date()` inside a Server Action is fine.)
- Tailwind v4 only: tokens live in `src/app/globals.css` under `@theme`. Do not add `tailwind.config.*` or `postcss.config.*`.
- Colors, exactly: fog `#EDF1EF`, paper `#FFFFFF`, canopy `#1E3D32`, ink `#24302B`, eucalyptus `#8FAE9C`, poppy `#F5821F`. The plan adds two tokens the spec implies: `poppy-light #F79A4A` (button hover, keeps ≥4.5:1 with canopy text) and `alert #A3261B` (error text, ≥6.5:1 on paper and fog).
- Poppy is used only on quote CTAs and the sticky bar, always with canopy text.
- Eucalyptus is never used for text on fog (2.1:1 fails WCAG AA). Step numerals are canopy text inside a eucalyptus ring.
- Fonts: Bitter for headings, wordmark and numerals (`font-display`); Atkinson Hyperlegible Next for everything else (`font-sans`).
- Body text ≥17px (form inputs 16px, to stop iOS zoom). Every tap target ≥48px (`min-h-12`). Every text pair meets WCAG AA.
- Copy rules: sentence case; no all-caps labels; no "→" in buttons; no "·"-joined meta strings in the UI. Copy comes from `src/content/site.ts`, never hard-coded in components, except form labels and validation messages, which live in the form and `src/lib/lead.ts`.
- Every placeholder fact carries `// LAUNCH-BLOCKER: <what to supply>` on its own line. Never invent testimonials, ratings, prices or guarantees.
- Every quote CTA renders `<a href="#quote" data-cta="quote">` (via `QuoteLink`). Every phone link renders `href="tel:+14155550123"` from `site.phone.tel` with `data-cta="phone"` (via `PhoneLink`).
- No `<nav>`, no header navigation links. The only internal link is `/privacy` (and the privacy page's link home).
- Motion only in response to the visitor, always under `motion-safe:`.
- ESLint runs `eslint-plugin-react-hooks` 7 (React Compiler rules): no synchronous `setState` in an effect body, no reading `ref.current` during render.
- Allowed new dev dependencies: `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom vite-tsconfig-paths`. No new runtime dependencies.
- Tests that touch `fetch`/`Response`/`AbortSignal` start with `// @vitest-environment node`.
- Every commit message ends with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **The Server Action throws or the network drops.** This includes an offline visitor and a stale deploy ("Failed to find Server Action"). The visitor must see the call/text fallback with every typed value kept, and the page must not crash. Test: Task 5, "shows the phone fallback when the action throws".
2. **The Apps Script web app answers HTTP 200 with `{ok:false}` or an HTML sign-in page.** This happens with a wrong secret or the wrong deployment access. It must count as a failed delivery, not a success. Tests: Task 2, "rejects a 200 response that says ok:false" and "rejects an HTML sign-in page".
3. **A destination hangs (Apps Script cold start, network stall).** Each destination gives up after `timeoutMs` (10 s default), and the other destination alone decides success. Tests: Task 2, "gives up on a hanging destination and still succeeds via the other" and "fails when every destination hangs".
4. **Enter pressed on step 1.** Implicit submission fires `submit` through the hidden step-2 button. It must act as "Next" and never call the action. Test: Task 5, "treats a submit on step 1 as Next and never sends".
5. **Lead text starting with `=`, `+`, `-` or `@`.** Google Sheets would run it as a formula (a malicious `=HYPERLINK` lands in the owner's Sheet). It must be stored as text. Test: Task 2, "stores formula-looking text as plain text".

---

## File Map

| File | Responsibility | Task |
|---|---|---|
| `vitest.config.mts`, `vitest.setup.ts` | Test runner | 1 |
| `src/content/site.ts` | Every business fact + all page copy | 1 |
| `src/lib/lead.ts` | Lead types, option lists, parse/validate/normalize | 1 |
| `scripts/launch-check.mjs` | Lists `LAUNCH-BLOCKER` markers, exits 1 if any | 1 |
| `src/lib/destinations/sheet.ts` | Apps Script webhook adapter | 2 |
| `src/lib/destinations/resend.ts` | Resend email adapter | 2 |
| `src/lib/deliver-lead.ts` | Fan out to configured destinations, decide success | 2 |
| `src/lib/quote-state.ts` | `QuoteState`/`QuoteAction` types + user-facing messages (client-safe) | 3 |
| `src/lib/quote-request.ts` | Honeypot → validate → deliver → `QuoteState` | 3 |
| `src/app/actions/request-quote.ts` | `'use server'` wrapper reading `process.env` | 3 |
| `docs/lead-setup.md`, `docs/google-apps-script.gs`, `.env.example` | Owner setup | 3 |
| `src/app/globals.css`, `src/app/layout.tsx` | Tokens, fonts, Google Ads tag | 4 |
| `src/lib/tracking.ts` | Google Ads conversion events | 4 |
| `src/lib/seo.ts` | `siteUrl()` (Task 4), page metadata (Task 9) | 4, 9 |
| `src/components/ui.ts` | Shared class lists | 5 |
| `src/lib/quote-events.ts` | `quote:select` event, nearest-form math | 5, 6 |
| `src/components/quote-form/{quote-form,fields}.tsx` | The 2-step form | 5 |
| `src/components/{icons,phone-link,quote-link,sticky-cta}.tsx` | CTAs | 6 |
| `src/components/{ridge-line,trust-badges,site-header,hero,problem,services,how-it-works}.tsx` | Top half of the page | 7 |
| `src/app/page.tsx` | Page composition | 7, 8, 9 |
| `src/lib/structured-data.ts`, `src/components/json-ld.tsx` | JSON-LD builders + script tag | 8, 9 |
| `src/components/{proof,faq,final-cta,service-area,site-footer}.tsx` | Bottom half of the page | 8 |
| `src/app/{opengraph-image.tsx,robots.ts,sitemap.ts,icon.svg}`, `src/app/privacy/page.tsx` | SEO + privacy | 9 |

---

### Task 1: Test runner, content module, lead validation, launch check

**Files:**
- Modify: `package.json` (scripts, devDependencies)
- Create: `vitest.config.mts`, `vitest.setup.ts`
- Create: `src/content/site.ts`
- Create: `src/lib/lead.ts`
- Test: `src/lib/lead.test.ts`
- Create: `scripts/launch-check.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `src/content/site.ts`:
    - Data: `site` (`name, tagline, url, phone{display,tel}, email, responseTime, offer, priceRange`), `TOWNS`, `OTHER_TOWN`, `TOWN_OPTIONS`, `SERVICE_IDS`, `services: Service[]`, `hero`, `trustBadges: string[]`, `problem`, `servicesIntro`, `howItWorks`, `owner`, `googleRating: Rating | null`, `testimonials`, `beforeAfter`, `proofFallback`, `faqs: Faq[]`, `finalCta`, `serviceArea`.
    - Types: `Town`, `ServiceId`, `Service`, `Photo`, `Rating`, `Testimonial`, `BeforeAfter`, `Faq`.
  - `src/lib/lead.ts`:
    - Option lists: `BEDROOMS`, `BATHROOMS`, `STEP_ONE_FIELDS`, `STEP_TWO_FIELDS`, `LEAD_FIELDS`.
    - Types: `LeadField`, `FieldErrors`, `LeadInput` (`Record<LeadField | "company" | "source", string>`), `Lead`, `ValidationResult`.
    - Functions: `emptyLeadInput(source?: string): LeadInput`, `normalizePhone(raw: string): string | null`, `formatPhone(digits: string): string`, `serviceName(id: ServiceId): string`, `validateFields(input: LeadInput, fields: readonly LeadField[]): FieldErrors`, `validateLead(input: LeadInput): ValidationResult`, `parseLeadForm(formData: FormData): LeadInput`, `toFormData(input: LeadInput): FormData`.
  - npm scripts `test`, `test:watch`, `launch-check`.

- [ ] **Step 1: Install the test toolchain and add scripts**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom vite-tsconfig-paths
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest" scripts.launch-check="node scripts/launch-check.mjs"
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.mts`:

```ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Create the content module**

Create `src/content/site.ts`:

```ts
// Every business fact and every line of page copy lives here, so changing the
// business means editing one file. Lines tagged LAUNCH-BLOCKER are placeholders:
// replace or delete them before real traffic arrives. `npm run launch-check`
// lists whatever is left.

export type Photo = { src: string; alt: string; width: number; height: number };

export const site = {
  name: "Marin Shine Co.",
  tagline: "A Higher Standard of Clean.",
  url: "https://www.example.com", // LAUNCH-BLOCKER: real domain
  phone: { display: "(415) 555-0123", tel: "+14155550123" }, // LAUNCH-BLOCKER: real phone number
  email: "hello@example.com", // LAUNCH-BLOCKER: real inbox
  responseTime: "2 business hours", // LAUNCH-BLOCKER: a reply time you can keep
  offer: "a free inside-oven or inside-fridge clean", // LAUNCH-BLOCKER: confirm the add-on and its terms
  priceRange: "$$", // LAUNCH-BLOCKER: confirm the price band shown to search engines
};

export const TOWNS = [
  "Belvedere",
  "Corte Madera",
  "Fairfax",
  "Greenbrae",
  "Kentfield",
  "Larkspur",
  "Mill Valley",
  "Novato",
  "Ross",
  "San Anselmo",
  "San Rafael",
  "Sausalito",
  "Tiburon",
] as const;
export const OTHER_TOWN = "Other Marin town";
export const TOWN_OPTIONS = [...TOWNS, OTHER_TOWN] as const;
export type Town = (typeof TOWN_OPTIONS)[number];

export const SERVICE_IDS = ["standard", "deep", "move", "vacation-rental"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export type Service = {
  id: ServiceId;
  name: string;
  /** Short label for the form's service tiles. */
  formLabel: string;
  summary: string;
  includes: string[];
  startingPrice: string;
};

export const services: Service[] = [
  {
    id: "standard",
    name: "Standard cleaning",
    formLabel: "Standard",
    summary:
      "Regular upkeep for a home that's already in good shape, weekly, every other week, or monthly.",
    includes: [
      "Dusting reachable surfaces",
      "Kitchen counters, sink, and stovetop",
      "Bathrooms scrubbed and sanitized",
      "Vacuuming and mopping every floor",
    ],
    startingPrice: "From $___", // LAUNCH-BLOCKER: starting price for standard cleaning
  },
  {
    id: "deep",
    name: "Deep cleaning",
    formLabel: "Deep clean",
    summary:
      "A top-to-bottom reset for homes that haven't had a professional clean in a while, or before a recurring plan starts.",
    includes: [
      "Everything in a standard clean",
      "Baseboards, door frames, and light switches",
      "Cabinet fronts and appliance exteriors",
      "Built-up grime in showers and tubs",
    ],
    startingPrice: "From $___", // LAUNCH-BLOCKER: starting price for deep cleaning
  },
  {
    id: "move",
    name: "Move-in / move-out cleaning",
    formLabel: "Move-in/out",
    summary: "An empty-home clean so you get your deposit back or start fresh in your new place.",
    includes: [
      "Inside cabinets, drawers, and closets",
      "Inside the oven and fridge",
      "Walls spot-cleaned",
      "Every floor and fixture",
    ],
    startingPrice: "From $___", // LAUNCH-BLOCKER: starting price for move-in/move-out cleaning
  },
  {
    id: "vacation-rental",
    name: "Vacation rental turnover",
    formLabel: "Vacation rental",
    summary: "Reliable turnovers between guests for Airbnb and VRBO hosts.",
    includes: [
      "Fresh linens and beds made",
      "Kitchen and bathrooms guest-ready",
      "Trash out and surfaces wiped",
      "Scheduled around your check-out times",
    ],
    startingPrice: "From $___", // LAUNCH-BLOCKER: starting price for vacation rental turnovers
  },
];

export const hero = {
  headline: "House Cleaning in Marin County",
  subhead: `Come home to a spotless house without giving up your weekend. Your first clean includes ${site.offer}.`,
  subheadShort: `Get your weekends back. Your first clean includes ${site.offer}.`,
  reassurance: "Free quote. No commitment.",
};

export const trustBadges: string[] = [
  "Bonded & insured", // LAUNCH-BLOCKER: keep only if true
  "Background-checked cleaners", // LAUNCH-BLOCKER: keep only if true
  "Locally owned in Marin", // LAUNCH-BLOCKER: keep only if true
];

export const problem = {
  heading: "Your house shouldn't take your whole weekend",
  pains: [
    "Saturday disappears into scrubbing, vacuuming, and laundry.",
    "You clean on Sunday, and by Wednesday it's a mess again.",
    "Guests are on their way and the house isn't ready.",
  ],
  solution:
    "We handle the cleaning so you don't have to. Our team shows up when we say we will, brings everything we need, and leaves your home spotless, so your weekends are for the trails on Mt. Tam, not the mop bucket.", // LAUNCH-BLOCKER: confirm you bring supplies
};

export const servicesIntro = {
  heading: "Cleaning for every kind of Marin home",
  body: "Not sure which one you need? Pick the closest match and we'll confirm it when we send your quote.",
};

export const howItWorks = {
  heading: "How it works",
  steps: [
    { title: "Request your quote", body: "Tell us about your home in under a minute." },
    { title: "Pick your date", body: "We'll confirm your price and find a time that works." },
    { title: "Relax", body: "Come home to a clean house." },
  ],
};

export const owner: { name: string; note: string; photo: Photo | null } = {
  name: "[Owner name]", // LAUNCH-BLOCKER: your name
  note: "Hi, I'm [Owner name]. I started Marin Shine Co. because [your reason, in two or three sentences].", // LAUNCH-BLOCKER: your note to customers
  photo: null, // LAUNCH-BLOCKER: a real photo of you (never stock or AI)
};

export type Rating = { value: number; count: number };
export type Testimonial = { quote: string; name: string; town: string };
export type BeforeAfter = { caption: string; before: Photo; after: Photo };

// Real reviews only. Each block stays hidden while it is empty.
export const googleRating: Rating | null = null;
export const testimonials: Testimonial[] = [];
export const beforeAfter: BeforeAfter[] = [];

export const proofFallback = {
  heading: "What you can count on",
  body: "We're a new business, so we earn every review by doing the job right.",
};

export type Faq = { question: string; answer: string };

const townList = `${TOWNS.slice(0, -1).join(", ")}, and ${TOWNS[TOWNS.length - 1]}`;

export const faqs: Faq[] = [
  {
    question: "Do I need to be home during the cleaning?",
    answer: "No. Many clients leave a key, a lockbox code, or a garage code. Whatever works for you.",
  },
  {
    question: "Do you bring your own supplies?",
    answer:
      "Yes, we bring all supplies and equipment. If you'd rather we use your products, just let us know.", // LAUNCH-BLOCKER: confirm supplies policy
  },
  {
    question: "How is the price determined?",
    answer:
      "It depends on your home's size, the type of cleaning, and how often you'd like us to come. Request a quote and we'll send you an exact price.",
  },
  {
    question: "Are you insured?",
    answer: "Yes. We're bonded and insured, and every cleaner is background-checked.", // LAUNCH-BLOCKER: only if true
  },
  {
    question: "What if I'm not happy with the clean?",
    answer: "Tell us within 24 hours and we'll come back and re-clean those areas for free.", // LAUNCH-BLOCKER: confirm your guarantee
  },
  {
    question: "Do I have to sign a contract?",
    answer: "No. Book a single clean or a recurring plan, and change or cancel anytime.", // LAUNCH-BLOCKER: confirm contract policy
  },
  {
    question: "Which towns do you serve?",
    answer: `All of Marin County: ${townList}.`,
  },
  {
    question: "Is the free add-on really free?",
    answer: `Yes. Your first clean includes ${site.offer}.`, // LAUNCH-BLOCKER: confirm offer terms
  },
];

export const finalCta = {
  heading: "Get your free quote",
  body: `Tell us about your home and we'll send your price. Your first clean includes ${site.offer}.`,
};

export const serviceArea = {
  heading: "Serving all of Marin County",
  body: "We clean homes in every town from Sausalito to Novato.",
};
```

- [ ] **Step 4: Write the failing validation tests**

Create `src/lib/lead.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SERVICE_IDS, services } from "@/content/site";
import {
  STEP_ONE_FIELDS,
  emptyLeadInput,
  formatPhone,
  normalizePhone,
  parseLeadForm,
  serviceName,
  toFormData,
  validateFields,
  validateLead,
  type LeadInput,
} from "./lead";

const valid: LeadInput = {
  ...emptyLeadInput("quote"),
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "  Jane Doe ",
  phone: "(415) 555-0123",
  email: " jane@example.com ",
  notes: " Two cats. ",
};

describe("content", () => {
  it("defines one service entry per service id, in order", () => {
    expect(services.map((service) => service.id)).toEqual([...SERVICE_IDS]);
  });
});

describe("normalizePhone", () => {
  it.each([
    ["(415) 555-0123", "4155550123"],
    ["415.555.0123", "4155550123"],
    ["+1 415 555 0123", "4155550123"],
    ["14155550123", "4155550123"],
  ])("accepts %s", (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it.each(["", "555-0123", "415555012", "1234567890", "4150550123", "41555501239"])(
    "rejects %j",
    (raw) => {
      expect(normalizePhone(raw)).toBeNull();
    },
  );
});

describe("formatPhone and serviceName", () => {
  it("formats 10 digits for people", () => {
    expect(formatPhone("4155550123")).toBe("(415) 555-0123");
  });

  it("names a service by its display name", () => {
    expect(serviceName("move")).toBe("Move-in / move-out cleaning");
  });
});

describe("validateLead", () => {
  it("returns a trimmed, normalized lead when everything is valid", () => {
    expect(validateLead(valid)).toEqual({
      ok: true,
      lead: {
        service: "deep",
        town: "Mill Valley",
        bedrooms: "3",
        bathrooms: "2",
        name: "Jane Doe",
        phone: "4155550123",
        email: "jane@example.com",
        notes: "Two cats.",
        source: "quote",
      },
    });
  });

  it("accepts the catch-all town and empty notes", () => {
    const result = validateLead({ ...valid, town: "Other Marin town", notes: "" });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["service", "", "Choose a service."],
    ["service", "carpet", "Choose a service."],
    ["town", "Oakland", "Choose your town."],
    ["bedrooms", "", "Choose the number of bedrooms."],
    ["bathrooms", "9", "Choose the number of bathrooms."],
    ["name", "   ", "Enter your name."],
    ["name", "x".repeat(101), "Keep your name under 100 characters."],
    ["phone", "555-0123", "Enter a 10-digit phone number."],
    ["email", "jane@", "Enter an email like name@example.com."],
    ["notes", "x".repeat(1001), "Keep notes under 1,000 characters."],
  ] as const)("rejects %s=%j", (field, value, message) => {
    expect(validateLead({ ...valid, [field]: value })).toEqual({
      ok: false,
      fieldErrors: { [field]: message },
    });
  });

  it("replaces an unexpected form id with 'unknown'", () => {
    const result = validateLead({ ...valid, source: "<script>" });
    expect(result.ok && result.lead.source).toBe("unknown");
  });
});

describe("validateFields", () => {
  it("checks only the fields it is given", () => {
    const stepOneDone = { ...emptyLeadInput(), service: "standard", town: "Ross", bedrooms: "Studio", bathrooms: "1" };
    expect(validateFields(stepOneDone, STEP_ONE_FIELDS)).toEqual({});
  });
});

describe("parseLeadForm and toFormData", () => {
  it("round-trips every input key", () => {
    expect(parseLeadForm(toFormData(valid))).toEqual(valid);
  });

  it("reads missing keys and file values as empty strings", () => {
    const formData = new FormData();
    formData.append("name", new Blob(["x"]));
    const parsed = parseLeadForm(formData);
    expect(parsed.name).toBe("");
    expect(parsed.service).toBe("");
    expect(parsed.source).toBe("");
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npx vitest run src/lib/lead.test.ts`
Expected: FAIL, `Failed to resolve import "./lead"` (the module doesn't exist yet).

- [ ] **Step 6: Implement the lead module**

Create `src/lib/lead.ts`:

```ts
import { SERVICE_IDS, TOWN_OPTIONS, services, type ServiceId, type Town } from "@/content/site";

export const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"] as const;
export const BATHROOMS = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"] as const;
export type Bedrooms = (typeof BEDROOMS)[number];
export type Bathrooms = (typeof BATHROOMS)[number];

export const STEP_ONE_FIELDS = ["service", "town", "bedrooms", "bathrooms"] as const;
export const STEP_TWO_FIELDS = ["name", "phone", "email", "notes"] as const;
export const LEAD_FIELDS = [...STEP_ONE_FIELDS, ...STEP_TWO_FIELDS] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];
export type FieldErrors = Partial<Record<LeadField, string>>;

/** Raw form values as typed. `company` is the bot honeypot; `source` is the id of the form used. */
export type LeadInput = Record<LeadField | "company" | "source", string>;

export type Lead = {
  service: ServiceId;
  town: Town;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  name: string;
  /** Exactly 10 digits, no formatting. */
  phone: string;
  email: string;
  notes: string;
  source: string;
};

export type ValidationResult = { ok: true; lead: Lead } | { ok: false; fieldErrors: FieldErrors };

const INPUT_KEYS = [...LEAD_FIELDS, "company", "source"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_PATTERN = /^[a-z][a-z-]{0,39}$/;

function isOneOf<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

export function emptyLeadInput(source = "unknown"): LeadInput {
  const input = Object.fromEntries(INPUT_KEYS.map((key) => [key, ""])) as LeadInput;
  input.source = source;
  return input;
}

/** Returns the 10-digit US number, or null when it can't be one. */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? digits : null;
}

export function formatPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function serviceName(id: ServiceId): string {
  return services.find((service) => service.id === id)?.name ?? id;
}

const RULES: Record<LeadField, (value: string) => string | null> = {
  service: (value) => (isOneOf(SERVICE_IDS, value) ? null : "Choose a service."),
  town: (value) => (isOneOf(TOWN_OPTIONS, value) ? null : "Choose your town."),
  bedrooms: (value) => (isOneOf(BEDROOMS, value) ? null : "Choose the number of bedrooms."),
  bathrooms: (value) => (isOneOf(BATHROOMS, value) ? null : "Choose the number of bathrooms."),
  name: (value) => {
    const name = value.trim();
    if (!name) return "Enter your name.";
    return name.length > 100 ? "Keep your name under 100 characters." : null;
  },
  phone: (value) => (normalizePhone(value) ? null : "Enter a 10-digit phone number."),
  email: (value) => {
    const email = value.trim();
    return email.length <= 254 && EMAIL_PATTERN.test(email)
      ? null
      : "Enter an email like name@example.com.";
  },
  notes: (value) => (value.trim().length > 1000 ? "Keep notes under 1,000 characters." : null),
};

export function validateFields(input: LeadInput, fields: readonly LeadField[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of fields) {
    const message = RULES[field](input[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateLead(input: LeadInput): ValidationResult {
  const fieldErrors = validateFields(input, LEAD_FIELDS);
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    lead: {
      service: input.service as ServiceId,
      town: input.town as Town,
      bedrooms: input.bedrooms as Bedrooms,
      bathrooms: input.bathrooms as Bathrooms,
      name: input.name.trim(),
      phone: normalizePhone(input.phone) as string,
      email: input.email.trim(),
      notes: input.notes.trim(),
      source: SOURCE_PATTERN.test(input.source) ? input.source : "unknown",
    },
  };
}

export function parseLeadForm(formData: FormData): LeadInput {
  const input = emptyLeadInput();
  for (const key of INPUT_KEYS) {
    const value = formData.get(key);
    input[key] = typeof value === "string" ? value : "";
  }
  return input;
}

export function toFormData(input: LeadInput): FormData {
  const formData = new FormData();
  for (const key of INPUT_KEYS) formData.append(key, input[key]);
  return formData;
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/lib/lead.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 8: Add the launch check**

Create `scripts/launch-check.mjs`:

```js
// Lists every LAUNCH-BLOCKER placeholder left in src/. Exits 1 while any remain,
// so it can gate a deploy.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const MARKER = "LAUNCH-BLOCKER";

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ts|tsx|css)$/.test(entry.name)) yield path;
  }
}

const hits = [];
for (const file of walk(root)) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      const at = line.indexOf(MARKER);
      if (at !== -1) hits.push(`${relative(process.cwd(), file)}:${index + 1}  ${line.slice(at).trim()}`);
    });
}

if (hits.length > 0) {
  console.log(`${hits.length} launch blocker(s) left:\n\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("No LAUNCH-BLOCKER markers left in src/.");
```

Run: `npm run launch-check; echo "exit=$?"`
Expected: about 20 lines like `src/content/site.ts:13  LAUNCH-BLOCKER: real domain`, then `exit=1`.

- [ ] **Step 9: Lint and type-check**

Run: `npm run lint && npx next typegen && npx tsc --noEmit`
Expected: no output from lint, no errors from tsc.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vitest.config.mts vitest.setup.ts src/content/site.ts src/lib/lead.ts src/lib/lead.test.ts scripts/launch-check.mjs
git commit -m "$(printf 'feat: add content module, lead validation, and test runner\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 2: Lead destinations and delivery

**Files:**
- Create: `src/lib/destinations/sheet.ts`, `src/lib/destinations/resend.ts`, `src/lib/deliver-lead.ts`
- Test: `src/lib/destinations/sheet.test.ts`, `src/lib/destinations/resend.test.ts`, `src/lib/deliver-lead.test.ts`

**Interfaces:**
- Consumes (Task 1): `Lead`, `formatPhone`, `serviceName` from `@/lib/lead`.
- Produces:
  - `sheet.ts`:
    - `type SheetConfig = { url: string; secret: string }`
    - `sheetConfigFromEnv(env: { LEADS_SHEET_WEBHOOK_URL?: string; LEADS_SHEET_SECRET?: string }): SheetConfig | null`
    - `asSheetText(value: string): string`
    - `appendToSheet(lead: Lead, submittedAt: string, config: SheetConfig, fetchFn: typeof fetch, timeoutMs: number): Promise<void>` (throws on failure)
  - `resend.ts`:
    - `type ResendConfig = { apiKey: string; from: string; to: string[] }`
    - `resendConfigFromEnv(env: { RESEND_API_KEY?: string; LEAD_EMAIL_FROM?: string; LEAD_EMAIL_TO?: string }): ResendConfig | null`
    - `leadEmail(lead: Lead, submittedAt: string): { subject: string; text: string }`
    - `emailLead(lead: Lead, submittedAt: string, config: ResendConfig, fetchFn: typeof fetch, timeoutMs: number): Promise<void>` (throws on failure)
  - `deliver-lead.ts`:
    - `type DeliveryEnv = Partial<Record<"NODE_ENV" | "RESEND_API_KEY" | "LEAD_EMAIL_TO" | "LEAD_EMAIL_FROM" | "LEADS_SHEET_WEBHOOK_URL" | "LEADS_SHEET_SECRET", string>>`
    - `type DeliveryDeps = { env: DeliveryEnv; fetch: typeof fetch; log: Pick<Console, "info" | "error">; now: () => Date; timeoutMs?: number }`
    - `formatPacificTime(date: Date): string`
    - `deliverLead(lead: Lead, deps: DeliveryDeps): Promise<{ ok: boolean }>`

- [ ] **Step 1: Write the failing Sheet adapter tests**

Create `src/lib/destinations/sheet.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Lead } from "../lead";
import { appendToSheet, asSheetText, sheetConfigFromEnv } from "./sheet";

const URL = "https://script.google.com/macros/s/abc/exec";
const config = { url: URL, secret: "s3cret" };
const lead: Lead = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "4155550123",
  email: "jane@example.com",
  notes: "Two cats.",
  source: "quote",
};

function respondWith(response: Response) {
  return vi.fn<typeof fetch>(async () => response);
}

describe("sheetConfigFromEnv", () => {
  it("needs both the URL and the secret", () => {
    expect(sheetConfigFromEnv({ LEADS_SHEET_WEBHOOK_URL: URL, LEADS_SHEET_SECRET: "s3cret" })).toEqual(config);
    expect(sheetConfigFromEnv({ LEADS_SHEET_WEBHOOK_URL: URL })).toBeNull();
    expect(sheetConfigFromEnv({ LEADS_SHEET_WEBHOOK_URL: " ", LEADS_SHEET_SECRET: "s3cret" })).toBeNull();
  });
});

describe("appendToSheet", () => {
  it("posts one row of JSON with the secret and readable values", async () => {
    const fetchFn = respondWith(Response.json({ ok: true }));
    await appendToSheet(lead, "Oct 12, 2026, 10:05 PT", config, fetchFn, 1000);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe(URL);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(init?.body))).toEqual({
      secret: "s3cret",
      submittedAt: "Oct 12, 2026, 10:05 PT",
      service: "Deep cleaning",
      town: "Mill Valley",
      bedrooms: "3",
      bathrooms: "2",
      name: "Jane Doe",
      phone: "(415) 555-0123",
      email: "jane@example.com",
      notes: "Two cats.",
      source: "quote",
    });
  });

  it("rejects a non-2xx response", async () => {
    const fetchFn = respondWith(new Response("nope", { status: 500 }));
    await expect(appendToSheet(lead, "t", config, fetchFn, 1000)).rejects.toThrow("Sheet webhook responded 500");
  });

  it("rejects a 200 response that says ok:false", async () => {
    const fetchFn = respondWith(Response.json({ ok: false, error: "unauthorized" }));
    await expect(appendToSheet(lead, "t", config, fetchFn, 1000)).rejects.toThrow("Sheet webhook rejected the lead");
  });

  it("rejects an HTML sign-in page", async () => {
    const page = new Response("<!DOCTYPE html><title>Sign in</title>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
    await expect(appendToSheet(lead, "t", config, respondWith(page), 1000)).rejects.toThrow(
      "Sheet webhook rejected the lead",
    );
  });

  it("stores formula-looking text as plain text", async () => {
    const fetchFn = respondWith(Response.json({ ok: true }));
    const risky = { ...lead, name: '=HYPERLINK("https://evil.example","x")', notes: "+1 call first" };
    await appendToSheet(risky, "t", config, fetchFn, 1000);

    const body = JSON.parse(String(fetchFn.mock.calls[0][1]?.body));
    expect(body.name).toBe(`'=HYPERLINK("https://evil.example","x")`);
    expect(body.notes).toBe("'+1 call first");
    expect(body.phone).toBe("(415) 555-0123");
  });
});

describe("asSheetText", () => {
  it.each([
    ["=1+1", "'=1+1"],
    ["+1", "'+1"],
    ["-1", "'-1"],
    ["@x", "'@x"],
    ["Jane", "Jane"],
    ["", ""],
  ])("%j becomes %j", (input, output) => {
    expect(asSheetText(input)).toBe(output);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/destinations/sheet.test.ts`
Expected: FAIL, `Failed to resolve import "./sheet"`.

- [ ] **Step 3: Implement the Sheet adapter**

Create `src/lib/destinations/sheet.ts`:

```ts
import { formatPhone, serviceName, type Lead } from "../lead";

export type SheetConfig = { url: string; secret: string };

export function sheetConfigFromEnv(env: {
  LEADS_SHEET_WEBHOOK_URL?: string;
  LEADS_SHEET_SECRET?: string;
}): SheetConfig | null {
  const url = env.LEADS_SHEET_WEBHOOK_URL?.trim();
  const secret = env.LEADS_SHEET_SECRET?.trim();
  return url && secret ? { url, secret } : null;
}

/** Google Sheets runs cells starting with = + - @ as formulas; a leading ' keeps them as text. */
export function asSheetText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/**
 * Appends the lead as one row through the Apps Script web app in docs/google-apps-script.gs.
 * Apps Script always answers HTTP 200, so success is the JSON body `{ ok: true }` and nothing else.
 */
export async function appendToSheet(
  lead: Lead,
  submittedAt: string,
  config: SheetConfig,
  fetchFn: typeof fetch,
  timeoutMs: number,
): Promise<void> {
  const response = await fetchFn(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: config.secret,
      submittedAt,
      service: serviceName(lead.service),
      town: lead.town,
      bedrooms: lead.bedrooms,
      bathrooms: lead.bathrooms,
      name: asSheetText(lead.name),
      phone: formatPhone(lead.phone),
      email: asSheetText(lead.email),
      notes: asSheetText(lead.notes),
      source: lead.source,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Sheet webhook responded ${response.status}`);

  const body: unknown = await response.json().catch(() => null);
  const accepted = typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
  if (!accepted) throw new Error(`Sheet webhook rejected the lead: ${JSON.stringify(body)}`);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/destinations/sheet.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing Resend adapter tests**

Create `src/lib/destinations/resend.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Lead } from "../lead";
import { emailLead, leadEmail, resendConfigFromEnv } from "./resend";

const config = { apiKey: "re_test", from: "Marin Shine Co. <leads@example.com>", to: ["owner@example.com"] };
const lead: Lead = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "4155550123",
  email: "jane@example.com",
  notes: "Two cats.",
  source: "quote",
};

describe("resendConfigFromEnv", () => {
  it("splits a comma-separated recipient list", () => {
    expect(
      resendConfigFromEnv({
        RESEND_API_KEY: "re_test",
        LEAD_EMAIL_FROM: config.from,
        LEAD_EMAIL_TO: "owner@example.com, partner@example.com",
      }),
    ).toEqual({ ...config, to: ["owner@example.com", "partner@example.com"] });
  });

  it("is null when the key, sender, or recipient is missing", () => {
    expect(resendConfigFromEnv({ LEAD_EMAIL_FROM: config.from, LEAD_EMAIL_TO: "a@b.co" })).toBeNull();
    expect(resendConfigFromEnv({ RESEND_API_KEY: "k", LEAD_EMAIL_TO: "a@b.co" })).toBeNull();
    expect(resendConfigFromEnv({ RESEND_API_KEY: "k", LEAD_EMAIL_FROM: config.from, LEAD_EMAIL_TO: " , " })).toBeNull();
  });
});

describe("leadEmail", () => {
  it("names the job in the subject and lists every field in the body", () => {
    const { subject, text } = leadEmail(lead, "Oct 12, 2026, 10:05 PT");
    expect(subject).toBe("New quote request: Deep cleaning in Mill Valley");
    expect(text).toContain("Service:   Deep cleaning");
    expect(text).toContain("Bathrooms: 2");
    expect(text).toContain("Phone:     (415) 555-0123");
    expect(text).toContain("Email:     jane@example.com");
    expect(text).toContain("Notes:     Two cats.");
    expect(text).toContain("Form:      quote");
    expect(text).toContain("Received:  Oct 12, 2026, 10:05 PT");
    expect(text).toContain("Reply to this email to answer Jane Doe directly.");
  });

  it("says (none) when there are no notes", () => {
    expect(leadEmail({ ...lead, notes: "" }, "t").text).toContain("Notes:     (none)");
  });
});

describe("emailLead", () => {
  it("sends a plain-text email through Resend with reply-to set to the customer", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => Response.json({ id: "email_1" }));
    await emailLead(lead, "Oct 12, 2026, 10:05 PT", config, fetchFn, 1000);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ Authorization: "Bearer re_test", "Content-Type": "application/json" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({
      from: config.from,
      to: ["owner@example.com"],
      reply_to: "jane@example.com",
      subject: "New quote request: Deep cleaning in Mill Valley",
      text: leadEmail(lead, "Oct 12, 2026, 10:05 PT").text,
    });
  });

  it("throws with the status and body when Resend refuses", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response("domain not verified", { status: 403 }));
    await expect(emailLead(lead, "t", config, fetchFn, 1000)).rejects.toThrow("Resend responded 403: domain not verified");
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/lib/destinations/resend.test.ts`
Expected: FAIL, `Failed to resolve import "./resend"`.

- [ ] **Step 7: Implement the Resend adapter**

Create `src/lib/destinations/resend.ts`:

```ts
import { formatPhone, serviceName, type Lead } from "../lead";

export type ResendConfig = { apiKey: string; from: string; to: string[] };

export function resendConfigFromEnv(env: {
  RESEND_API_KEY?: string;
  LEAD_EMAIL_FROM?: string;
  LEAD_EMAIL_TO?: string;
}): ResendConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.LEAD_EMAIL_FROM?.trim();
  const to = (env.LEAD_EMAIL_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return apiKey && from && to.length > 0 ? { apiKey, from, to } : null;
}

/** Plain text only: customer input is never placed into HTML. */
export function leadEmail(lead: Lead, submittedAt: string): { subject: string; text: string } {
  const rows: [string, string][] = [
    ["Service", serviceName(lead.service)],
    ["Town", lead.town],
    ["Bedrooms", lead.bedrooms],
    ["Bathrooms", lead.bathrooms],
    ["Name", lead.name],
    ["Phone", formatPhone(lead.phone)],
    ["Email", lead.email],
    ["Notes", lead.notes || "(none)"],
    ["Form", lead.source],
    ["Received", submittedAt],
  ];
  const text = [
    "New quote request from the website.",
    "",
    ...rows.map(([label, value]) => `${`${label}:`.padEnd(11)}${value}`),
    "",
    `Reply to this email to answer ${lead.name} directly.`,
  ].join("\n");
  return { subject: `New quote request: ${serviceName(lead.service)} in ${lead.town}`, text };
}

export async function emailLead(
  lead: Lead,
  submittedAt: string,
  config: ResendConfig,
  fetchFn: typeof fetch,
  timeoutMs: number,
): Promise<void> {
  const { subject, text } = leadEmail(lead, submittedAt);
  const response = await fetchFn("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.from, to: config.to, reply_to: lead.email, subject, text }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend responded ${response.status}: ${detail}`);
  }
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run src/lib/destinations/resend.test.ts`
Expected: PASS.

- [ ] **Step 9: Write the failing delivery tests**

Create `src/lib/deliver-lead.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { deliverLead, formatPacificTime, type DeliveryEnv } from "./deliver-lead";
import type { Lead } from "./lead";

const lead: Lead = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "4155550123",
  email: "jane@example.com",
  notes: "",
  source: "quote",
};

const bothConfigured: DeliveryEnv = {
  NODE_ENV: "production",
  LEADS_SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/abc/exec",
  LEADS_SHEET_SECRET: "s3cret",
  RESEND_API_KEY: "re_test",
  LEAD_EMAIL_TO: "owner@example.com",
  LEAD_EMAIL_FROM: "Marin Shine Co. <leads@example.com>",
};

type Handler = () => Promise<Response>;
const sheetOk: Handler = async () => Response.json({ ok: true });
const emailOk: Handler = async () => Response.json({ id: "email_1" });
const serverError: Handler = async () => new Response("boom", { status: 500 });
const hang: Handler = () => new Promise<Response>(() => {});

/** Routes Resend calls to `email` and everything else to `sheet`, honoring abort signals. */
function makeFetch(sheet: Handler, email: Handler) {
  return vi.fn<typeof fetch>(
    (input, init) =>
      new Promise<Response>((resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        const handler = String(input).startsWith("https://api.resend.com") ? email : sheet;
        handler().then(resolve, reject);
      }),
  );
}

function makeDeps(fetchFn: ReturnType<typeof makeFetch>, env: DeliveryEnv = bothConfigured) {
  return {
    env,
    fetch: fetchFn,
    log: { info: vi.fn(), error: vi.fn() },
    now: () => new Date("2026-10-12T17:05:00Z"),
    timeoutMs: 50,
  };
}

describe("formatPacificTime", () => {
  it("shows the owner's local time", () => {
    expect(formatPacificTime(new Date("2026-10-12T17:05:00Z"))).toBe("Oct 12, 2026, 10:05 PT");
  });
});

describe("deliverLead", () => {
  it("succeeds when both destinations accept the lead", async () => {
    const deps = makeDeps(makeFetch(sheetOk, emailOk));
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.fetch).toHaveBeenCalledTimes(2);
    expect(deps.log.error).not.toHaveBeenCalled();
  });

  it("succeeds when only the email gets through, and logs the Sheet failure", async () => {
    const deps = makeDeps(makeFetch(serverError, emailOk));
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.log.error).toHaveBeenCalledWith("Lead delivery to Google Sheet failed:", expect.any(Error));
  });

  it("fails when both destinations fail, and logs the lead so it can be recovered", async () => {
    const deps = makeDeps(makeFetch(serverError, serverError));
    expect(await deliverLead(lead, deps)).toEqual({ ok: false });
    expect(deps.log.error).toHaveBeenCalledWith("Lead NOT delivered to any destination. Lead:", lead);
  });

  it("only calls the destinations that are configured", async () => {
    const env: DeliveryEnv = {
      NODE_ENV: "production",
      LEADS_SHEET_WEBHOOK_URL: bothConfigured.LEADS_SHEET_WEBHOOK_URL,
      LEADS_SHEET_SECRET: "s3cret",
    };
    const deps = makeDeps(makeFetch(sheetOk, emailOk), env);
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
    expect(String(deps.fetch.mock.calls[0][0])).toContain("script.google.com");
  });

  it("fails in production when no destination is configured", async () => {
    const deps = makeDeps(makeFetch(sheetOk, emailOk), { NODE_ENV: "production" });
    expect(await deliverLead(lead, deps)).toEqual({ ok: false });
    expect(deps.fetch).not.toHaveBeenCalled();
    expect(deps.log.error).toHaveBeenCalledWith("Lead NOT delivered: no lead destination is configured. Lead:", lead);
  });

  it("logs the lead and succeeds in development when no destination is configured", async () => {
    const deps = makeDeps(makeFetch(sheetOk, emailOk), { NODE_ENV: "development" });
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.fetch).not.toHaveBeenCalled();
    expect(deps.log.info).toHaveBeenCalledWith("[dev] No lead destination configured. Lead:", lead);
  });

  it("gives up on a hanging destination and still succeeds via the other", async () => {
    const deps = makeDeps(makeFetch(hang, emailOk));
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.log.error).toHaveBeenCalledWith("Lead delivery to Google Sheet failed:", expect.anything());
  });

  it("fails when every destination hangs", async () => {
    const deps = makeDeps(makeFetch(hang, hang));
    expect(await deliverLead(lead, deps)).toEqual({ ok: false });
  });
});
```

- [ ] **Step 10: Run it to verify it fails**

Run: `npx vitest run src/lib/deliver-lead.test.ts`
Expected: FAIL, `Failed to resolve import "./deliver-lead"`.

- [ ] **Step 11: Implement delivery**

Create `src/lib/deliver-lead.ts`:

```ts
import { appendToSheet, sheetConfigFromEnv } from "./destinations/sheet";
import { emailLead, resendConfigFromEnv } from "./destinations/resend";
import type { Lead } from "./lead";

export type DeliveryEnv = Partial<
  Record<
    | "NODE_ENV"
    | "RESEND_API_KEY"
    | "LEAD_EMAIL_TO"
    | "LEAD_EMAIL_FROM"
    | "LEADS_SHEET_WEBHOOK_URL"
    | "LEADS_SHEET_SECRET",
    string
  >
>;

export type DeliveryDeps = {
  env: DeliveryEnv;
  fetch: typeof fetch;
  log: Pick<Console, "info" | "error">;
  now: () => Date;
  /** Per destination. Defaults to 10 seconds. */
  timeoutMs?: number;
};

const pacificTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatPacificTime(date: Date): string {
  return `${pacificTime.format(date)} PT`;
}

/**
 * Sends the lead to every configured destination at once. The lead counts as delivered
 * when at least one destination accepts it; every failure is logged.
 */
export async function deliverLead(lead: Lead, deps: DeliveryDeps): Promise<{ ok: boolean }> {
  const submittedAt = formatPacificTime(deps.now());
  const timeoutMs = deps.timeoutMs ?? 10_000;
  const destinations: { name: string; send: () => Promise<void> }[] = [];

  const sheet = sheetConfigFromEnv(deps.env);
  if (sheet) {
    destinations.push({
      name: "Google Sheet",
      send: () => appendToSheet(lead, submittedAt, sheet, deps.fetch, timeoutMs),
    });
  }
  const resend = resendConfigFromEnv(deps.env);
  if (resend) {
    destinations.push({
      name: "Resend email",
      send: () => emailLead(lead, submittedAt, resend, deps.fetch, timeoutMs),
    });
  }

  if (destinations.length === 0) {
    if (deps.env.NODE_ENV === "production") {
      deps.log.error("Lead NOT delivered: no lead destination is configured. Lead:", lead);
      return { ok: false };
    }
    deps.log.info("[dev] No lead destination configured. Lead:", lead);
    return { ok: true };
  }

  const results = await Promise.allSettled(destinations.map((destination) => destination.send()));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      deps.log.error(`Lead delivery to ${destinations[index].name} failed:`, result.reason);
    }
  });
  const ok = results.some((result) => result.status === "fulfilled");
  if (!ok) deps.log.error("Lead NOT delivered to any destination. Lead:", lead);
  return { ok };
}
```

- [ ] **Step 12: Run all lib tests**

Run: `npx vitest run src/lib`
Expected: PASS (lead, sheet, resend, deliver-lead).

- [ ] **Step 13: Commit**

```bash
git add src/lib/destinations src/lib/deliver-lead.ts src/lib/deliver-lead.test.ts
git commit -m "$(printf 'feat: deliver leads to Google Sheet and Resend with failover\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 3: Quote request handler, Server Action, owner setup docs

**Files:**
- Create: `src/lib/quote-state.ts`, `src/lib/quote-request.ts`, `src/app/actions/request-quote.ts`
- Test: `src/lib/quote-request.test.ts`
- Create: `docs/lead-setup.md`, `docs/google-apps-script.gs`, `.env.example`
- Modify: `.gitignore` (allow `.env.example`)

**Interfaces:**
- Consumes:
  - Task 1: `parseLeadForm`, `validateLead`, `FieldErrors`; `site`.
  - Task 2: `deliverLead`, `DeliveryDeps`.
- Produces:
  - `quote-state.ts` (client-safe):
    - `type QuoteState = { status: "idle" } | { status: "success" } | { status: "error"; message: string; fieldErrors: FieldErrors }`
    - `type QuoteAction = (previous: QuoteState, formData: FormData) => Promise<QuoteState>`
    - `initialQuoteState`, `DELIVERY_FAILED_MESSAGE`, `INVALID_MESSAGE`
  - `quote-request.ts`: `handleQuoteRequest(formData: FormData, deps: DeliveryDeps): Promise<QuoteState>`
  - `request-quote.ts`: Server Action `requestQuote: QuoteAction`

- [ ] **Step 1: Write the failing handler tests**

Create `src/lib/quote-request.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { DeliveryEnv } from "./deliver-lead";
import { handleQuoteRequest } from "./quote-request";
import { DELIVERY_FAILED_MESSAGE, INVALID_MESSAGE } from "./quote-state";

const valid = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "415-555-0123",
  email: "jane@example.com",
  notes: "",
  company: "",
  source: "quote",
};

const configured: DeliveryEnv = {
  NODE_ENV: "production",
  RESEND_API_KEY: "re_test",
  LEAD_EMAIL_TO: "owner@example.com",
  LEAD_EMAIL_FROM: "Marin Shine Co. <leads@example.com>",
};

function form(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.append(key, value);
  return formData;
}

function makeDeps(env: DeliveryEnv, fetchFn = vi.fn<typeof fetch>(async () => Response.json({ id: "email_1" }))) {
  return { env, fetch: fetchFn, log: { info: vi.fn(), error: vi.fn() }, now: () => new Date("2026-10-12T17:05:00Z") };
}

describe("handleQuoteRequest", () => {
  it("delivers a valid request and reports success", async () => {
    const deps = makeDeps(configured);
    expect(await handleQuoteRequest(form(valid), deps)).toEqual({ status: "success" });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns field errors and delivers nothing when the input is invalid", async () => {
    const deps = makeDeps(configured);
    expect(await handleQuoteRequest(form({ ...valid, phone: "123" }), deps)).toEqual({
      status: "error",
      message: INVALID_MESSAGE,
      fieldErrors: { phone: "Enter a 10-digit phone number." },
    });
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it("pretends success for bots that fill the honeypot, and delivers nothing", async () => {
    const deps = makeDeps(configured);
    expect(await handleQuoteRequest(form({ ...valid, company: "Acme" }), deps)).toEqual({ status: "success" });
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it("returns the call-us message when no destination accepts the lead", async () => {
    const deps = makeDeps(configured, vi.fn<typeof fetch>(async () => new Response("down", { status: 503 })));
    expect(await handleQuoteRequest(form(valid), deps)).toEqual({
      status: "error",
      message: DELIVERY_FAILED_MESSAGE,
      fieldErrors: {},
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/quote-request.test.ts`
Expected: FAIL, `Failed to resolve import "./quote-request"`.

- [ ] **Step 3: Implement the state types and the handler**

Create `src/lib/quote-state.ts`:

```ts
import { site } from "@/content/site";
import type { FieldErrors } from "./lead";

// Shared by the Server Action and the client form, so it must stay free of server-only code.

export type QuoteState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors: FieldErrors };

export type QuoteAction = (previous: QuoteState, formData: FormData) => Promise<QuoteState>;

export const initialQuoteState: QuoteState = { status: "idle" };

export const DELIVERY_FAILED_MESSAGE = `We couldn't send your request. Try again, or call or text ${site.phone.display}.`;
export const INVALID_MESSAGE = "Check the highlighted fields and try again.";
```

Create `src/lib/quote-request.ts`:

```ts
import { deliverLead, type DeliveryDeps } from "./deliver-lead";
import { parseLeadForm, validateLead } from "./lead";
import { DELIVERY_FAILED_MESSAGE, INVALID_MESSAGE, type QuoteState } from "./quote-state";

export async function handleQuoteRequest(formData: FormData, deps: DeliveryDeps): Promise<QuoteState> {
  const input = parseLeadForm(formData);
  if (input.company.trim() !== "") {
    deps.log.info("Honeypot field was filled; submission dropped.");
    return { status: "success" };
  }

  const result = validateLead(input);
  if (!result.ok) return { status: "error", message: INVALID_MESSAGE, fieldErrors: result.fieldErrors };

  const { ok } = await deliverLead(result.lead, deps);
  return ok ? { status: "success" } : { status: "error", message: DELIVERY_FAILED_MESSAGE, fieldErrors: {} };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/quote-request.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the Server Action**

Create `src/app/actions/request-quote.ts`:

```ts
"use server";

import { handleQuoteRequest } from "@/lib/quote-request";
import type { QuoteState } from "@/lib/quote-state";

export async function requestQuote(_previous: QuoteState, formData: FormData): Promise<QuoteState> {
  return handleQuoteRequest(formData, {
    env: process.env,
    fetch,
    log: console,
    now: () => new Date(),
  });
}
```

- [ ] **Step 6: Add the Apps Script and owner setup guide**

Create `docs/google-apps-script.gs`:

```js
/**
 * Marin Shine Co. quote requests -> this Google Sheet.
 * Paste into Extensions > Apps Script of your leads Sheet. Setup: docs/lead-setup.md
 *
 * The website sends JSON with a shared secret. Apps Script always answers HTTP 200,
 * so the website treats only { ok: true } as success.
 */
const SHEET_NAME = "Leads";
const COLUMNS = ["submittedAt", "service", "town", "bedrooms", "bathrooms", "name", "phone", "email", "notes", "source"];
const HEADERS = ["Received", "Service", "Town", "Bedrooms", "Bathrooms", "Name", "Phone", "Email", "Notes", "Form"];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty("LEADS_SHEET_SECRET");
    if (!secret || body.secret !== secret) return reply({ ok: false, error: "unauthorized" });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      sheet.appendRow(COLUMNS.map((key) => (body[key] == null ? "" : String(body[key]))));
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false, error: String(error) });
  }
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
```

Create `docs/lead-setup.md`:

````markdown
# Lead setup: Google Sheet, email, and Google Ads

Every quote request goes to a Google Sheet **and** your inbox at the same time. If one of them is down, the other still gets the lead. If both are down, the visitor is asked to call or text you, and the lead is written to the server log.

In production, at least one destination must be set up. Otherwise every visitor sees "We couldn't send your request."

## 1. Google Sheet

1. Create a Google Sheet (e.g. "Marin Shine Co. leads").
2. Open **Extensions → Apps Script**. Replace everything in `Code.gs` with the contents of [`google-apps-script.gs`](google-apps-script.gs), then save.
3. Make a secret: run `openssl rand -hex 24` in a terminal and copy the output.
4. In Apps Script, open **Project Settings → Script properties → Add script property**. Name: `LEADS_SHEET_SECRET`. Value: the secret.
5. Click **Deploy → New deployment**, choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and approve the permissions.
6. Copy the **Web app URL** (it ends in `/exec`).
7. Set `LEADS_SHEET_WEBHOOK_URL` to that URL and `LEADS_SHEET_SECRET` to the same secret.

If you change the script later, use **Deploy → Manage deployments → Edit → Version: New version**. Otherwise the URL keeps running the old code.

## 2. Email (Resend)

1. Sign up at resend.com and add your domain under **Domains**. Add the DNS records it shows, then wait for "Verified".
2. Create an API key under **API Keys** with sending access.
3. Set:
   - `RESEND_API_KEY`: the key
   - `LEAD_EMAIL_FROM`: e.g. `Marin Shine Co. <leads@yourdomain.com>` (must use the verified domain)
   - `LEAD_EMAIL_TO`: where leads go. Separate several addresses with commas.

Before your domain is verified, you can test with `LEAD_EMAIL_FROM="Marin Shine Co. <onboarding@resend.dev>"`, but Resend only delivers it to the email address you signed up with.

Each lead email has the customer as **Reply-To**, so pressing Reply answers them directly.

## 3. Google Ads conversions (when ads start)

Create two conversion actions in Google Ads: "Quote request" (website) and "Phone call clicks" (calls from website). Then set:

- `NEXT_PUBLIC_GOOGLE_ADS_ID`: e.g. `AW-123456789`
- `NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO`: e.g. `AW-123456789/AbCdEf` (fires only after a successful quote request)
- `NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO`: e.g. `AW-123456789/GhIjKl` (fires when someone taps the phone number)

`NEXT_PUBLIC_*` values are built into the page, so rebuild and redeploy after changing them.

## 4. Test it

1. `cp .env.example .env.local` and fill in the values.
2. `npm run dev`, open http://localhost:3000, and send a quote request with your own details.
3. Check for a new row in the Sheet's "Leads" tab and a new email in your inbox.
````

Create `.env.example`:

```bash
# Copy to .env.local and fill in. Setup steps: docs/lead-setup.md
# In production, configure at least one lead destination, or every quote request fails.

# Email each lead (Resend)
RESEND_API_KEY=
LEAD_EMAIL_FROM="Marin Shine Co. <onboarding@resend.dev>"
LEAD_EMAIL_TO=

# Add each lead as a row in a Google Sheet (Apps Script web app)
LEADS_SHEET_WEBHOOK_URL=
LEADS_SHEET_SECRET=

# Public site address, used for canonical URLs, the sitemap, and structured data
NEXT_PUBLIC_SITE_URL=https://www.example.com

# Google Ads conversion tracking (optional until ads run)
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO=
NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO=
```

Append to `.gitignore`, directly under the existing `.env*` line:

```gitignore
!.env.example
```

Run: `git check-ignore .env.example; echo "ignored-exit=$?"`
Expected: no path printed, `ignored-exit=1` (the file is not ignored).

- [ ] **Step 7: Lint, type-check, run all tests**

Run: `npm run lint && npx next typegen && npx tsc --noEmit && npm test`
Expected: lint and tsc clean; all test files pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/quote-state.ts src/lib/quote-request.ts src/lib/quote-request.test.ts src/app/actions/request-quote.ts docs/lead-setup.md docs/google-apps-script.gs .env.example .gitignore
git commit -m "$(printf 'feat: add quote request Server Action and lead setup guide\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 4: Design tokens, fonts, layout, conversion tracking

**Files:**
- Modify: `src/app/globals.css` (replace), `src/app/layout.tsx` (replace)
- Create: `src/lib/tracking.ts`, `src/lib/seo.ts`
- Test: `src/lib/tracking.test.ts`, `src/lib/seo.test.ts`

**Interfaces:**
- Consumes (Task 1): `site`.
- Produces:
  - Tailwind tokens: `fog`, `paper`, `canopy`, `ink`, `eucalyptus`, `poppy`, `poppy-light`, `alert`; fonts `font-display`/`font-sans`; animation `animate-step-in`.
  - `trackLeadConversion(): boolean` and `trackPhoneClick(): boolean` (true when an event was sent).
  - `siteUrl(): string` (absolute origin, no trailing slash).

- [ ] **Step 1: Write the failing tracking and URL tests**

Create `src/lib/tracking.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackLeadConversion, trackPhoneClick } from "./tracking";

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.gtag;
});

describe("conversion tracking", () => {
  it("does nothing when no conversion ID is configured", () => {
    window.gtag = vi.fn();
    expect(trackLeadConversion()).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("does nothing when the ID is set but the Google tag never loaded", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO", "AW-1/lead");
    expect(trackLeadConversion()).toBe(false);
  });

  it("sends the lead conversion", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO", "AW-1/lead");
    const gtag = vi.fn();
    window.gtag = gtag;
    expect(trackLeadConversion()).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: "AW-1/lead" });
  });

  it("sends the phone-call conversion", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO", "AW-1/call");
    const gtag = vi.fn();
    window.gtag = gtag;
    expect(trackPhoneClick()).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: "AW-1/call" });
  });
});
```

Create `src/lib/seo.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { siteUrl } from "./seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://marinshine.example/");
    expect(siteUrl()).toBe("https://marinshine.example");
  });

  it("falls back to the configured domain", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl()).toBe(site.url);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/tracking.test.ts src/lib/seo.test.ts`
Expected: FAIL, `Failed to resolve import "./tracking"` and `"./seo"`.

- [ ] **Step 3: Implement tracking and siteUrl**

Create `src/lib/tracking.ts`:

```ts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendConversion(sendTo: string | undefined): boolean {
  if (!sendTo || typeof window === "undefined" || typeof window.gtag !== "function") return false;
  window.gtag("event", "conversion", { send_to: sendTo });
  return true;
}

// process.env.NEXT_PUBLIC_* must be written out literally so Next inlines it at build time.

/** Call only after a quote request was delivered. */
export function trackLeadConversion(): boolean {
  return sendConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO);
}

export function trackPhoneClick(): boolean {
  return sendConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO);
}
```

Create `src/lib/seo.ts`:

```ts
import { site } from "@/content/site";

/** Absolute site origin without a trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/+$/, "");
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/lib/tracking.test.ts src/lib/seo.test.ts`
Expected: PASS.

- [ ] **Step 5: Replace the global stylesheet with the design tokens**

Replace the whole of `src/app/globals.css` with:

```css
@import "tailwindcss";

/* "The fog lifts over Mt. Tam": tokens from the design spec, section 4. */
@theme {
  --color-fog: #edf1ef;
  --color-paper: #ffffff;
  --color-canopy: #1e3d32;
  --color-ink: #24302b;
  --color-eucalyptus: #8fae9c;
  --color-poppy: #f5821f;
  --color-poppy-light: #f79a4a;
  --color-alert: #a3261b;

  --animate-step-in: step-in 200ms ease-out;

  @keyframes step-in {
    from {
      opacity: 0;
      transform: translateX(1rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
}

@theme inline {
  --font-sans: var(--font-atkinson), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-bitter), ui-serif, Georgia, serif;
}

/* Light only: the page sets its own colors so OS dark mode can't invert them. */
body {
  background: var(--color-fog);
  color: var(--color-ink);
  font-size: 1.0625rem;
  line-height: 1.6;
}
```

- [ ] **Step 6: Replace the root layout**

Replace the whole of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Bitter } from "next/font/google";
import Script from "next/script";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
};

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bitter.variable} ${atkinson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        {googleAdsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(googleAdsId)});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run lint && npm test && npm run build`
Expected: lint clean, tests pass, and the build prints the route table with `○ /` (static). The scaffold page still renders, now in the new fonts.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/lib/tracking.ts src/lib/tracking.test.ts src/lib/seo.ts src/lib/seo.test.ts
git commit -m "$(printf 'feat: add design tokens, fonts, and Google Ads conversion tracking\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---
### Task 5: The 2-step quote form

**Files:**
- Create: `src/components/ui.ts`, `src/lib/quote-events.ts`
- Create: `src/components/quote-form/fields.tsx`, `src/components/quote-form/quote-form.tsx`
- Test: `src/components/quote-form/quote-form.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: `services`, `TOWN_OPTIONS`, `site`, `hero`, `ServiceId`; `BEDROOMS`, `BATHROOMS`, `LEAD_FIELDS`, `STEP_ONE_FIELDS`, `emptyLeadInput`, `toFormData`, `validateFields`, `FieldErrors`, `LeadField`, `LeadInput`.
  - Task 3: `QuoteAction`, `QuoteState`, `initialQuoteState`, `DELIVERY_FAILED_MESSAGE`.
  - Task 4: `trackLeadConversion`.
- Produces:
  - `ui.ts`: `focusRing`, `primaryButton`, `secondaryButton`, `fieldControl`, `formCard`, `sectionInner`, `sectionHeading` (class strings).
  - `quote-events.ts`: `QUOTE_SELECT_EVENT = "quote:select"`, `type QuoteSelectDetail = { service: ServiceId }`, `selectService(service: ServiceId): void`.
  - `QuoteForm({ id: string; action: QuoteAction; title: string })`. It renders a `<form id={id} data-quote-form>`, or after success a `<div id={id} data-quote-form>`. Its focus target is marked `data-quote-focus`.

- [ ] **Step 1: Add the shared class lists and the service-select event**

Create `src/components/ui.ts`:

```ts
// Shared class lists, so every quote button, field, and section looks and behaves the same.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy";

export const primaryButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-poppy px-6 text-lg font-bold text-canopy hover:bg-poppy-light disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`;

export const secondaryButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-canopy px-5 font-bold text-canopy hover:bg-paper ${focusRing}`;

export const fieldControl = `mt-1 block min-h-12 w-full min-w-0 rounded-[10px] border border-canopy/30 bg-paper px-3 text-base text-ink aria-[invalid=true]:border-2 aria-[invalid=true]:border-alert ${focusRing}`;

export const formCard =
  "relative scroll-mt-4 rounded-2xl border border-canopy/15 bg-paper p-4 text-ink md:p-6";

export const sectionInner = "mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24";

export const sectionHeading =
  "font-display text-3xl font-bold leading-tight text-canopy md:text-5xl";
```

Create `src/lib/quote-events.ts`:

```ts
import type { ServiceId } from "@/content/site";

/** Fired on window when a "Get a quote" link picks a service; every quote form listens. */
export const QUOTE_SELECT_EVENT = "quote:select";
export type QuoteSelectDetail = { service: ServiceId };

export function selectService(service: ServiceId): void {
  window.dispatchEvent(new CustomEvent<QuoteSelectDetail>(QUOTE_SELECT_EVENT, { detail: { service } }));
}
```

- [ ] **Step 2: Write the failing form tests**

Create `src/components/quote-form/quote-form.test.tsx`:

```tsx
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectService } from "@/lib/quote-events";
import {
  DELIVERY_FAILED_MESSAGE,
  INVALID_MESSAGE,
  type QuoteAction,
  type QuoteState,
} from "@/lib/quote-state";
import { trackLeadConversion } from "@/lib/tracking";
import { QuoteForm } from "./quote-form";

vi.mock("@/lib/tracking", () => ({
  trackLeadConversion: vi.fn(() => true),
  trackPhoneClick: vi.fn(() => true),
}));

type User = ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  vi.mocked(trackLeadConversion).mockClear();
});

function renderForm(action: QuoteAction = vi.fn<QuoteAction>(async () => ({ status: "success" }))) {
  const user = userEvent.setup();
  render(<QuoteForm id="quote" action={action} title="Get your free quote" />);
  return { user, action };
}

async function completeStepOne(user: User) {
  await user.click(screen.getByRole("radio", { name: "Deep clean" }));
  await user.selectOptions(screen.getByLabelText("Town"), "Mill Valley");
  await user.selectOptions(screen.getByLabelText("Bedrooms"), "3");
  await user.selectOptions(screen.getByLabelText("Bathrooms"), "2");
  await user.click(screen.getByRole("button", { name: "Next: your details" }));
}

async function completeStepTwo(user: User) {
  await user.type(screen.getByLabelText("Name"), "Jane Doe");
  await user.type(screen.getByLabelText("Phone"), "415-555-0123");
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
}

async function submitValidRequest(user: User) {
  await completeStepOne(user);
  await completeStepTwo(user);
  await user.click(screen.getByRole("button", { name: "Get my free quote" }));
}

describe("QuoteForm step 1", () => {
  it("shows what's missing and stays on step 1 when Next is pressed early", async () => {
    const { user, action } = renderForm();
    await user.click(screen.getByRole("button", { name: "Next: your details" }));

    expect(screen.getByText("Choose a service.")).toBeInTheDocument();
    expect(screen.getByText("Choose your town.")).toBeInTheDocument();
    expect(screen.getByText("Choose the number of bedrooms.")).toBeInTheDocument();
    expect(screen.getByText("Choose the number of bathrooms.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).not.toBeVisible();
    expect(screen.getByRole("radio", { name: "Standard" })).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("moves to step 2 and focuses the step label once step 1 is complete", async () => {
    const { user } = renderForm();
    await completeStepOne(user);

    expect(screen.getByLabelText("Name")).toBeVisible();
    expect(screen.getByText("Step 2 of 2")).toHaveFocus();
  });

  it("keeps step 1 choices when going Back", async () => {
    const { user } = renderForm();
    await completeStepOne(user);
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("radio", { name: "Deep clean" })).toBeChecked();
    expect(screen.getByLabelText("Town")).toHaveValue("Mill Valley");
    expect(screen.getByText("Step 1 of 2")).toHaveFocus();
  });

  it("treats a submit on step 1 as Next and never sends", async () => {
    const { user, action } = renderForm();
    await user.click(screen.getByRole("radio", { name: "Deep clean" }));
    fireEvent.submit(screen.getByRole("form", { name: "Get your free quote" }));

    expect(screen.getByText("Choose your town.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("pre-selects the service announced by a quote link", () => {
    renderForm();
    act(() => selectService("move"));
    expect(screen.getByRole("radio", { name: "Move-in/out" })).toBeChecked();
  });
});

describe("QuoteForm step 2", () => {
  it("shows what's missing without sending", async () => {
    const { user, action } = renderForm();
    await completeStepOne(user);
    await user.click(screen.getByRole("button", { name: "Get my free quote" }));

    expect(screen.getByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a 10-digit phone number.")).toBeInTheDocument();
    expect(screen.getByText("Enter an email like name@example.com.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("sends every field once, disables the button while sending, then confirms", async () => {
    let finish: (state: QuoteState) => void = () => {};
    const action = vi.fn<QuoteAction>(
      () =>
        new Promise<QuoteState>((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = renderForm(action);
    await completeStepOne(user);
    await completeStepTwo(user);
    await user.dblClick(screen.getByRole("button", { name: "Get my free quote" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(Object.fromEntries(action.mock.calls[0][1])).toEqual({
      service: "deep",
      town: "Mill Valley",
      bedrooms: "3",
      bathrooms: "2",
      name: "Jane Doe",
      phone: "415-555-0123",
      email: "jane@example.com",
      notes: "",
      company: "",
      source: "quote",
    });
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();

    await act(async () => finish({ status: "success" }));
    expect(await screen.findByText("Quote request sent.")).toHaveFocus();
    expect(trackLeadConversion).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("shows the phone fallback and keeps every value when delivery fails", async () => {
    const action = vi.fn<QuoteAction>(async () => ({
      status: "error",
      message: DELIVERY_FAILED_MESSAGE,
      fieldErrors: {},
    }));
    const { user } = renderForm(action);
    await submitValidRequest(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(DELIVERY_FAILED_MESSAGE);
    expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
    expect(screen.getByRole("button", { name: "Get my free quote" })).toBeEnabled();
    expect(trackLeadConversion).not.toHaveBeenCalled();
  });

  it("shows the phone fallback when the action throws", async () => {
    const action = vi.fn<QuoteAction>(async () => {
      throw new Error("Failed to find Server Action");
    });
    const { user } = renderForm(action);
    await submitValidRequest(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(DELIVERY_FAILED_MESSAGE);
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    expect(trackLeadConversion).not.toHaveBeenCalled();
  });

  it("returns to step 1 when the server rejects a step 1 field", async () => {
    const action = vi.fn<QuoteAction>(async () => ({
      status: "error",
      message: INVALID_MESSAGE,
      fieldErrors: { town: "Choose your town." },
    }));
    const { user } = renderForm(action);
    await submitValidRequest(user);

    expect(await screen.findByText("Choose your town.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Town")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(INVALID_MESSAGE);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/components/quote-form`
Expected: FAIL, `Failed to resolve import "./quote-form"`.

- [ ] **Step 4: Implement the field components**

Create `src/components/quote-form/fields.tsx`:

```tsx
import { fieldControl } from "@/components/ui";

type BaseProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function errorProps(id: string, error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

const labelClass = "text-sm font-bold text-canopy";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-bold text-alert">
      {message}
    </p>
  );
}

export function SelectField({
  id,
  name,
  label,
  value,
  options,
  error,
  onChange,
}: BaseProps & { options: readonly string[] }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldControl}
        {...errorProps(id, error)}
      >
        <option value="">Choose</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  error,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
}: BaseProps & {
  type?: "text" | "tel" | "email";
  inputMode?: "text" | "tel" | "email";
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldControl}
        {...errorProps(id, error)}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function TextAreaField({ id, name, label, value, error, onChange }: BaseProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={3}
        maxLength={1000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldControl} py-2`}
        {...errorProps(id, error)}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
```

- [ ] **Step 5: Implement the form**

Create `src/components/quote-form/quote-form.tsx`:

```tsx
"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { flushSync } from "react-dom";
import { focusRing, formCard, primaryButton } from "@/components/ui";
import { TOWN_OPTIONS, hero, services, site } from "@/content/site";
import {
  BATHROOMS,
  BEDROOMS,
  LEAD_FIELDS,
  STEP_ONE_FIELDS,
  emptyLeadInput,
  toFormData,
  validateFields,
  type FieldErrors,
  type LeadField,
  type LeadInput,
} from "@/lib/lead";
import { QUOTE_SELECT_EVENT, type QuoteSelectDetail } from "@/lib/quote-events";
import {
  DELIVERY_FAILED_MESSAGE,
  initialQuoteState,
  type QuoteAction,
  type QuoteState,
} from "@/lib/quote-state";
import { trackLeadConversion } from "@/lib/tracking";
import { FieldError, SelectField, TextAreaField, TextField } from "./fields";

type QuoteFormProps = {
  /** Anchor id. The hero form must be "quote": every quote link points at #quote. */
  id: string;
  action: QuoteAction;
  title: string;
};

function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

function withoutError(errors: FieldErrors, field: LeadField): FieldErrors {
  if (!(field in errors)) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

/** A thrown action (offline, stale deploy) must still leave the visitor a way to reach us. */
async function callAction(action: QuoteAction, previous: QuoteState, formData: FormData): Promise<QuoteState> {
  try {
    return await action(previous, formData);
  } catch {
    return { status: "error", message: DELIVERY_FAILED_MESSAGE, fieldErrors: {} };
  }
}

export function QuoteForm({ id, action, title }: QuoteFormProps) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<LeadInput>(() => emptyLeadInput(id));
  const [errors, setErrors] = useState<FieldErrors>({});
  const stepLabel = useRef<HTMLParagraphElement>(null);
  const successMessage = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);

  const submit = useMemo(
    () =>
      async (previous: QuoteState, formData: FormData): Promise<QuoteState> => {
        const next = await callAction(action, previous, formData);
        if (next.status === "success") trackLeadConversion();
        if (next.status === "error") {
          const serverErrors = next.fieldErrors;
          setErrors(serverErrors);
          if (STEP_ONE_FIELDS.some((field) => serverErrors[field])) setStep(1);
        }
        return next;
      },
    [action],
  );
  const [state, dispatch, pending] = useActionState(submit, initialQuoteState);

  useEffect(() => {
    inFlight.current = false;
    if (state.status === "success") successMessage.current?.focus();
  }, [state]);

  useEffect(() => {
    function handleSelect(event: Event) {
      const { service } = (event as CustomEvent<QuoteSelectDetail>).detail;
      setValues((current) => ({ ...current, service }));
      setErrors((current) => withoutError(current, "service"));
    }
    window.addEventListener(QUOTE_SELECT_EVENT, handleSelect);
    return () => window.removeEventListener(QUOTE_SELECT_EVENT, handleSelect);
  }, []);

  function update(field: LeadField | "company", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== "company") setErrors((current) => withoutError(current, field));
  }

  function focusFirstInvalid(found: FieldErrors) {
    const first = LEAD_FIELDS.find((field) => found[field]);
    if (!first) return;
    const target = first === "service" ? fieldId(`service-${services[0].id}`) : fieldId(first);
    document.getElementById(target)?.focus();
  }

  function showStep(next: 1 | 2) {
    flushSync(() => setStep(next));
    stepLabel.current?.focus();
  }

  function goToStepTwo() {
    const found = validateFields(values, STEP_ONE_FIELDS);
    setErrors(found);
    if (hasErrors(found)) {
      focusFirstInvalid(found);
      return;
    }
    showStep(2);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter on step 1 submits through the hidden step 2 button; treat it as Next.
    if (step === 1) {
      goToStepTwo();
      return;
    }
    if (inFlight.current || pending) return;

    const found = validateFields(values, LEAD_FIELDS);
    if (hasErrors(found)) {
      if (STEP_ONE_FIELDS.some((field) => found[field])) flushSync(() => setStep(1));
      setErrors(found);
      focusFirstInvalid(found);
      return;
    }
    setErrors({});
    inFlight.current = true;
    startTransition(() => dispatch(toFormData(values)));
  }

  if (state.status === "success") {
    return (
      <div id={id} data-quote-form className={formCard}>
        <p
          ref={successMessage}
          tabIndex={-1}
          role="status"
          data-quote-focus
          className="font-display text-2xl font-bold text-canopy outline-none"
        >
          Quote request sent.
        </p>
        <p className="mt-2">We&apos;ll reach out within {site.responseTime} with your price.</p>
      </div>
    );
  }

  const describedBy = (field: LeadField) => (errors[field] ? `${fieldId(field)}-error` : undefined);

  return (
    <form
      id={id}
      data-quote-form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={fieldId("title")}
      className={formCard}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={fieldId("title")} className="font-display text-xl font-bold text-canopy md:text-2xl">
          {title}
        </h2>
        <p
          ref={stepLabel}
          tabIndex={-1}
          data-quote-focus
          className="shrink-0 text-sm font-bold text-ink outline-none"
        >
          Step {step} of 2
        </p>
      </div>

      <div hidden={step !== 1} className="mt-4 space-y-4 motion-safe:animate-step-in">
        <fieldset aria-describedby={describedBy("service")}>
          <legend className="text-sm font-bold text-canopy">What do you need?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex min-h-12 cursor-pointer items-center rounded-xl border-2 border-canopy/20 px-3 font-bold text-canopy has-checked:border-canopy has-checked:bg-fog has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-canopy"
              >
                <input
                  id={fieldId(`service-${service.id}`)}
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={values.service === service.id}
                  onChange={() => update("service", service.id)}
                  aria-invalid={errors.service ? true : undefined}
                  className="sr-only"
                />
                {service.formLabel}
              </label>
            ))}
          </div>
          <FieldError id={`${fieldId("service")}-error`} message={errors.service} />
        </fieldset>

        <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-2">
          <SelectField
            id={fieldId("town")}
            name="town"
            label="Town"
            value={values.town}
            options={TOWN_OPTIONS}
            error={errors.town}
            onChange={(value) => update("town", value)}
          />
          <SelectField
            id={fieldId("bedrooms")}
            name="bedrooms"
            label="Bedrooms"
            value={values.bedrooms}
            options={BEDROOMS}
            error={errors.bedrooms}
            onChange={(value) => update("bedrooms", value)}
          />
          <SelectField
            id={fieldId("bathrooms")}
            name="bathrooms"
            label="Bathrooms"
            value={values.bathrooms}
            options={BATHROOMS}
            error={errors.bathrooms}
            onChange={(value) => update("bathrooms", value)}
          />
        </div>

        <button type="button" onClick={goToStepTwo} className={`${primaryButton} w-full`}>
          Next: your details
        </button>
        <p className="text-center text-sm">{hero.reassurance}</p>
      </div>

      <div hidden={step !== 2} className="mt-4 space-y-4 motion-safe:animate-step-in">
        <TextField
          id={fieldId("name")}
          name="name"
          label="Name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(value) => update("name", value)}
        />
        <TextField
          id={fieldId("phone")}
          name="phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(value) => update("phone", value)}
        />
        <TextField
          id={fieldId("email")}
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(value) => update("email", value)}
        />
        <TextAreaField
          id={fieldId("notes")}
          name="notes"
          label="Anything we should know? (optional)"
          value={values.notes}
          error={errors.notes}
          onChange={(value) => update("notes", value)}
        />
        <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
          {pending ? "Sending…" : "Get my free quote"}
        </button>
        <p className="text-sm">
          We&apos;ll never share your info.{" "}
          <Link href="/privacy" className={`font-bold underline ${focusRing}`}>
            Privacy policy
          </Link>
        </p>
        <button
          type="button"
          onClick={() => showStep(1)}
          className={`min-h-12 text-sm font-bold text-canopy underline ${focusRing}`}
        >
          Back
        </button>
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={fieldId("company")}>Company</label>
        <input
          id={fieldId("company")}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) => update("company", event.target.value)}
        />
      </div>

      {state.status === "error" ? (
        <p role="alert" className="mt-4 font-bold text-alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/components/quote-form`
Expected: PASS (10 tests).

- [ ] **Step 7: Lint and type-check**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean. If `react-hooks` flags anything, fix the code rather than disabling the rule (see Global Constraints).

- [ ] **Step 8: Commit**

```bash
git add src/components/ui.ts src/lib/quote-events.ts src/components/quote-form
git commit -m "$(printf 'feat: add 2-step quote form\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 6: Phone link, quote link, mobile sticky bar

**Files:**
- Create: `src/components/icons.tsx`, `src/components/phone-link.tsx`, `src/components/quote-link.tsx`, `src/components/sticky-cta.tsx`
- Modify: `src/lib/quote-events.ts` (add `nearestIndex`)
- Test: `src/lib/quote-events.test.ts`, `src/components/phone-link.test.tsx`, `src/components/quote-link.test.tsx`, `src/components/sticky-cta.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: `site`, `ServiceId`.
  - Task 4: `trackPhoneClick`.
  - Task 5: `selectService`, `QUOTE_SELECT_EVENT`, `primaryButton`, `secondaryButton`, `focusRing`, and the `data-quote-form`/`data-quote-focus` markers.
- Produces:
  - `PhoneIcon`, `CheckIcon`, `PlusIcon` (`{ className?: string }`).
  - `PhoneLink({ className?: string; children?: ReactNode })`: `<a href="tel:…" data-cta="phone">`; default text `site.phone.display`.
  - `QuoteLink({ service?: ServiceId; className?: string; children: ReactNode })`: `<a href="#quote" data-cta="quote">`.
  - `StickyCta()`: a mobile-only bar marked `data-sticky-cta` and `data-visible`.
  - `nearestIndex(tops: number[]): number` (-1 for an empty list).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/quote-events.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { nearestIndex } from "./quote-events";

describe("nearestIndex", () => {
  it("picks the element whose top is closest to the top of the viewport", () => {
    expect(nearestIndex([-900, 300])).toBe(1);
    expect(nearestIndex([-100, 600])).toBe(0);
  });

  it("returns -1 when there is nothing to pick", () => {
    expect(nearestIndex([])).toBe(-1);
  });
});
```

Create `src/components/phone-link.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { trackPhoneClick } from "@/lib/tracking";
import { PhoneLink } from "./phone-link";

vi.mock("@/lib/tracking", () => ({
  trackLeadConversion: vi.fn(() => true),
  trackPhoneClick: vi.fn(() => true),
}));

it("dials the business number and records a call conversion", async () => {
  render(<PhoneLink />);
  const link = screen.getByRole("link", { name: site.phone.display });
  expect(link).toHaveAttribute("href", `tel:${site.phone.tel}`);
  expect(link).toHaveAttribute("data-cta", "phone");

  link.addEventListener("click", (event) => event.preventDefault()); // jsdom can't dial
  await userEvent.click(link);
  expect(trackPhoneClick).toHaveBeenCalledTimes(1);
});
```

Create `src/components/quote-link.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { QUOTE_SELECT_EVENT } from "@/lib/quote-events";
import { QuoteLink } from "./quote-link";

const listener = vi.fn();
afterEach(() => {
  window.removeEventListener(QUOTE_SELECT_EVENT, listener);
  listener.mockReset();
});

it("selects the service and brings the nearest quote form into view", async () => {
  render(
    <>
      <form data-quote-form id="quote">
        <p data-quote-focus tabIndex={-1}>
          Hero step
        </p>
      </form>
      <form data-quote-form id="final-quote">
        <p data-quote-focus tabIndex={-1}>
          Final step
        </p>
      </form>
      <QuoteLink service="deep">Get a quote</QuoteLink>
    </>,
  );
  const [heroForm, finalForm] = Array.from(document.querySelectorAll<HTMLElement>("[data-quote-form]"));
  heroForm.getBoundingClientRect = () => ({ top: -900 }) as DOMRect;
  finalForm.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
  heroForm.scrollIntoView = vi.fn();
  finalForm.scrollIntoView = vi.fn();
  window.addEventListener(QUOTE_SELECT_EVENT, listener);

  const link = screen.getByRole("link", { name: "Get a quote" });
  expect(link).toHaveAttribute("href", "#quote");
  expect(link).toHaveAttribute("data-cta", "quote");
  await userEvent.click(link);

  expect(finalForm.scrollIntoView).toHaveBeenCalledTimes(1);
  expect(heroForm.scrollIntoView).not.toHaveBeenCalled();
  expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ service: "deep" });
  expect(screen.getByText("Final step")).toHaveFocus();
});

it("falls back to the #quote anchor when no form is on the page", () => {
  render(<QuoteLink>Get my free quote</QuoteLink>);
  const notPrevented = fireEvent.click(screen.getByRole("link", { name: "Get my free quote" }));
  expect(notPrevented).toBe(true);
});
```

Create `src/components/sticky-cta.test.tsx`:

```tsx
import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StickyCta } from "./sticky-cta";

class FakeObserver {
  static latest: FakeObserver | null = null;
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeObserver.latest = this;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function entry(target: Element, isIntersecting: boolean, bottom: number) {
  return { target, isIntersecting, boundingClientRect: { bottom } } as unknown as IntersectionObserverEntry;
}

function report(entries: IntersectionObserverEntry[]) {
  const observer = FakeObserver.latest!;
  act(() => observer.callback(entries, observer as unknown as IntersectionObserver));
}

function renderPage() {
  const { container } = render(
    <>
      <div data-quote-form id="quote" />
      <div data-quote-form id="final-quote" />
      <StickyCta />
    </>,
  );
  const [heroForm, finalForm] = Array.from(container.querySelectorAll("[data-quote-form]"));
  const bar = container.querySelector("[data-sticky-cta]")!;
  return { heroForm, finalForm, bar };
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeObserver.latest = null;
});

it("appears once the hero form is scrolled past and hides while a form is on screen", () => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  const { heroForm, finalForm, bar } = renderPage();
  expect(bar).toHaveAttribute("data-visible", "false");
  expect(bar).toHaveAttribute("inert");

  report([entry(heroForm, false, -50), entry(finalForm, false, 2400)]);
  expect(bar).toHaveAttribute("data-visible", "true");
  expect(bar).not.toHaveAttribute("inert");

  report([entry(finalForm, true, 600)]);
  expect(bar).toHaveAttribute("data-visible", "false");
});

it("stays hidden while the visitor is still above the hero form", () => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  const { heroForm, finalForm, bar } = renderPage();
  report([entry(heroForm, false, 900), entry(finalForm, false, 3000)]);
  expect(bar).toHaveAttribute("data-visible", "false");
});

it("renders hidden without crashing when IntersectionObserver is unavailable", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const { bar } = renderPage();
  expect(bar).toHaveAttribute("data-visible", "false");
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/quote-events.test.ts src/components/phone-link.test.tsx src/components/quote-link.test.tsx src/components/sticky-cta.test.tsx`
Expected: FAIL. `nearestIndex` is not exported, and `./phone-link`, `./quote-link` and `./sticky-cta` can't be resolved.

- [ ] **Step 3: Add `nearestIndex`**

Append to `src/lib/quote-events.ts`:

```ts
/** Index of the element whose top edge is closest to the top of the viewport. */
export function nearestIndex(tops: number[]): number {
  let best = -1;
  let bestDistance = Infinity;
  tops.forEach((top, index) => {
    const distance = Math.abs(top);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}
```

- [ ] **Step 4: Add the icons and links**

Create `src/components/icons.tsx`:

```tsx
type IconProps = { className?: string };

const base = {
  "aria-hidden": true,
  focusable: false,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
```

Create `src/components/phone-link.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { site } from "@/content/site";
import { trackPhoneClick } from "@/lib/tracking";

export function PhoneLink({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a href={`tel:${site.phone.tel}`} data-cta="phone" onClick={() => trackPhoneClick()} className={className}>
      {children ?? site.phone.display}
    </a>
  );
}
```

Create `src/components/quote-link.tsx`:

```tsx
"use client";

import type { MouseEvent, ReactNode } from "react";
import type { ServiceId } from "@/content/site";
import { nearestIndex, selectService } from "@/lib/quote-events";

type QuoteLinkProps = { service?: ServiceId; className?: string; children: ReactNode };

/** Every quote CTA. Without JavaScript it is a plain link to the hero form (#quote). */
export function QuoteLink({ service, className, children }: QuoteLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-quote-form]"));
    if (forms.length === 0) return;
    event.preventDefault();

    if (service) selectService(service);
    const target = forms[nearestIndex(forms.map((form) => form.getBoundingClientRect().top))];
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    target.querySelector<HTMLElement>("[data-quote-focus]")?.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <a href="#quote" data-cta="quote" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
```

Create `src/components/sticky-cta.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { PhoneIcon } from "./icons";
import { PhoneLink } from "./phone-link";
import { QuoteLink } from "./quote-link";
import { primaryButton, secondaryButton } from "./ui";

/** Mobile-only bar that appears after the hero form and hides while any quote form is on screen. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const forms = Array.from(document.querySelectorAll("[data-quote-form]"));
    if (forms.length === 0) return;

    const latest = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) latest.set(entry.target, entry);
      const formOnScreen = Array.from(latest.values()).some((entry) => entry.isIntersecting);
      const heroEntry = latest.get(forms[0]);
      const pastHero = heroEntry !== undefined && heroEntry.boundingClientRect.bottom < 0;
      setVisible(pastHero && !formOnScreen);
    });
    forms.forEach((form) => observer.observe(form));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-sticky-cta
      data-visible={visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-canopy/15 bg-paper p-3 md:hidden motion-safe:transition-transform ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <QuoteLink className={`${primaryButton} flex-1`}>Get my quote</QuoteLink>
      <PhoneLink className={secondaryButton}>
        <PhoneIcon className="size-5" />
        Call
      </PhoneLink>
    </div>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/quote-events.test.ts src/components/phone-link.test.tsx src/components/quote-link.test.tsx src/components/sticky-cta.test.tsx`
Expected: PASS.

- [ ] **Step 6: Lint, type-check, full suite**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: clean; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/icons.tsx src/components/phone-link.tsx src/components/phone-link.test.tsx src/components/quote-link.tsx src/components/quote-link.test.tsx src/components/sticky-cta.tsx src/components/sticky-cta.test.tsx src/lib/quote-events.ts src/lib/quote-events.test.ts
git commit -m "$(printf 'feat: add phone link, quote link, and mobile sticky bar\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 7: Header, hero, problem, services, how it works

**Files:**
- Create: `src/components/ridge-line.tsx`, `src/components/trust-badges.tsx`, `src/components/site-header.tsx`, `src/components/hero.tsx`, `src/components/problem.tsx`, `src/components/services.tsx`, `src/components/how-it-works.tsx`
- Modify: `src/app/page.tsx` (replace the scaffold)
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: content.
  - Task 3: `requestQuote`.
  - Task 5: `QuoteForm`, ui classes.
  - Task 6: `QuoteLink`, `PhoneLink`, `StickyCta`, icons.
- Produces:
  - `RIDGE_PATH: string` (SVG path, viewBox `0 0 1440 160`) and `RidgeLine({ className })`.
  - `TrustBadges({ className })`, `SiteHeader()`, `Hero()`, `Problem()`, `Services()`, `HowItWorks()`.
  - Default export `Home` in `src/app/page.tsx`.

- [ ] **Step 1: Write the failing page test**

Create `src/app/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hero } from "@/content/site";
import Home from "./page";

describe("Home page", () => {
  it("has exactly one H1: the Marin County keyword headline", () => {
    render(<Home />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(hero.headline);
  });

  it("opens with the hero quote form and has no navigation", () => {
    const { container } = render(<Home />);
    expect(container.querySelector("#quote[data-quote-form]")).not.toBeNull();
    expect(container.querySelector("nav")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/app/page.test.tsx`
Expected: FAIL. The scaffold's H1 reads "To get started, edit the page.tsx file.", and there is no `#quote` form.

- [ ] **Step 3: Build the top-of-page components**

Create `src/components/ridge-line.tsx`:

```tsx
/** Single-stroke silhouette of Mt. Tamalpais ("the Sleeping Lady"), drawn in a 1440×160 box. */
export const RIDGE_PATH =
  "M0 140 C120 132 220 120 320 104 S470 70 540 58 C580 50 600 44 630 40 L655 30 C668 26 680 28 690 34 C720 46 740 44 770 36 L800 24 C812 20 826 22 840 30 C900 60 980 82 1080 96 S1300 124 1440 132";

export function RidgeLine({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 160" preserveAspectRatio="none" className={className}>
      <path d={RIDGE_PATH} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
```

Create `src/components/trust-badges.tsx`:

```tsx
import { trustBadges } from "@/content/site";
import { CheckIcon } from "./icons";

export function TrustBadges({ className = "" }: { className?: string }) {
  if (trustBadges.length === 0) return null;
  return (
    <ul aria-label="Why customers trust us" className={`flex flex-wrap gap-x-6 gap-y-2 font-bold text-canopy ${className}`}>
      {trustBadges.map((badge) => (
        <li key={badge} className="flex items-center gap-2">
          <CheckIcon className="size-5 shrink-0" />
          {badge}
        </li>
      ))}
    </ul>
  );
}
```

Create `src/components/site-header.tsx`:

```tsx
import { site } from "@/content/site";
import { PhoneIcon } from "./icons";
import { PhoneLink } from "./phone-link";
import { secondaryButton } from "./ui";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-5">
      <p className="flex items-baseline gap-3">
        <span className="font-display text-xl font-bold text-canopy md:text-2xl">{site.name}</span>
        <span className="hidden text-ink md:inline">{site.tagline}</span>
      </p>
      <PhoneLink className={secondaryButton}>
        <PhoneIcon className="size-5" />
        <span className="md:hidden">Call</span>
        <span className="hidden md:inline">Call or text {site.phone.display}</span>
      </PhoneLink>
    </header>
  );
}
```

Create `src/components/hero.tsx`:

```tsx
import { requestQuote } from "@/app/actions/request-quote";
import { hero } from "@/content/site";
import { QuoteForm } from "./quote-form/quote-form";
import { RidgeLine } from "./ridge-line";
import { TrustBadges } from "./trust-badges";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 pb-28 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:gap-x-12 md:gap-y-8 md:px-8 md:pb-44 md:pt-12">
        <div className="md:col-start-1 md:row-start-1">
          <h1
            id="hero-heading"
            className="max-w-[16ch] font-display text-[2rem] font-bold leading-[1.1] text-canopy md:text-[4rem]"
          >
            {hero.headline}
          </h1>
          <p className="mt-3 max-w-[40ch] md:mt-6 md:text-xl">
            <span className="md:hidden">{hero.subheadShort}</span>
            <span className="hidden md:inline">{hero.subhead}</span>
          </p>
        </div>
        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <QuoteForm id="quote" action={requestQuote} title="Get your free quote" />
        </div>
        <TrustBadges className="md:col-start-1 md:row-start-2 md:self-start" />
      </div>
      <RidgeLine className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-eucalyptus md:h-36" />
    </section>
  );
}
```

Create `src/components/problem.tsx`:

```tsx
import { problem } from "@/content/site";
import { sectionHeading, sectionInner } from "./ui";

export function Problem() {
  return (
    <section aria-labelledby="problem-heading">
      <div className={sectionInner}>
        <h2 id="problem-heading" className={`${sectionHeading} max-w-[20ch]`}>
          {problem.heading}
        </h2>
        <ul className="mt-8 max-w-[40ch] space-y-4 border-l-2 border-eucalyptus pl-6 text-xl md:text-2xl">
          {problem.pains.map((pain) => (
            <li key={pain}>{pain}</li>
          ))}
        </ul>
        <p className="mt-10 max-w-[60ch] text-lg">{problem.solution}</p>
      </div>
    </section>
  );
}
```

Create `src/components/services.tsx`:

```tsx
import { services, servicesIntro } from "@/content/site";
import { CheckIcon } from "./icons";
import { QuoteLink } from "./quote-link";
import { primaryButton, sectionHeading, sectionInner } from "./ui";

/** Laid out as a price list (rows and rules), not a grid of cards. */
export function Services() {
  return (
    <section aria-labelledby="services-heading" className="bg-paper">
      <div className={sectionInner}>
        <h2 id="services-heading" className={`${sectionHeading} max-w-[22ch]`}>
          {servicesIntro.heading}
        </h2>
        <p className="mt-4 max-w-[60ch]">{servicesIntro.body}</p>
        <ul className="mt-10 divide-y divide-eucalyptus border-y border-eucalyptus">
          {services.map((service) => (
            <li
              key={service.id}
              className="grid gap-4 py-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-start md:gap-10"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-canopy">{service.name}</h3>
                <p className="mt-1 font-bold">{service.startingPrice}</p>
              </div>
              <div>
                <p>{service.summary}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {service.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckIcon className="mt-1 size-5 shrink-0 text-canopy" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <QuoteLink service={service.id} className={`${primaryButton} w-full md:w-auto md:self-center`}>
                Get a quote<span className="sr-only"> for {service.name.toLowerCase()}</span>
              </QuoteLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

Create `src/components/how-it-works.tsx`:

```tsx
import { howItWorks } from "@/content/site";
import { QuoteLink } from "./quote-link";
import { primaryButton, sectionHeading, sectionInner } from "./ui";

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading">
      <div className={sectionInner}>
        <h2 id="how-heading" className={sectionHeading}>
          {howItWorks.heading}
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 md:flex-col">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-eucalyptus font-display text-xl font-bold text-canopy"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold text-canopy">{step.title}</h3>
                <p className="mt-1">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <QuoteLink className={`${primaryButton} mt-10`}>Get my free quote</QuoteLink>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace the scaffold page and remove its assets**

Replace the whole of `src/app/page.tsx` with:

```tsx
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Problem } from "@/components/problem";
import { Services } from "@/components/services";
import { SiteHeader } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Services />
        <HowItWorks />
      </main>
      <StickyCta />
    </>
  );
}
```

```bash
git rm -q public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

- [ ] **Step 5: Run the page test to verify it passes**

Run: `npx vitest run src/app/page.test.tsx`
Expected: PASS.

- [ ] **Step 6: Verify lint, types, tests, and a static build**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: all clean. The route table shows `○ /` (static) with no prerender errors.

- [ ] **Step 7: Commit**

```bash
git add src/components src/app/page.tsx src/app/page.test.tsx
git commit -m "$(printf 'feat: build header, hero, problem, services, and how-it-works sections\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 8: Proof, FAQ, final CTA, service area, footer

**Files:**
- Create: `src/lib/structured-data.ts`, `src/components/json-ld.tsx`
- Create: `src/components/proof.tsx`, `src/components/faq.tsx`, `src/components/final-cta.tsx`, `src/components/service-area.tsx`, `src/components/site-footer.tsx`
- Modify: `src/app/page.tsx` (full section order), `src/app/page.test.tsx` (CTA consistency)
- Test: `src/lib/structured-data.test.ts`, `src/components/faq.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: content.
  - Task 3: `requestQuote`.
  - Task 5: `QuoteForm`, ui classes.
  - Task 6: `PhoneLink`, icons.
  - Task 7: the existing page.
- Produces:
  - `serializeJsonLd(data: unknown): string`, `faqJsonLd(items: readonly Faq[])`, `JsonLd({ data: object })`.
  - `Proof()`, `Faq()` (renders its own FAQPage JSON-LD), `FinalCta()` (second form, `id="final-quote"`), `ServiceArea()`, `SiteFooter()`.

- [ ] **Step 1: Write the failing structured-data and FAQ tests**

Create `src/lib/structured-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { faqJsonLd, serializeJsonLd } from "./structured-data";

describe("serializeJsonLd", () => {
  it("escapes < so the data can't close its script tag", () => {
    const out = serializeJsonLd({ text: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ text: "</script><script>alert(1)</script>" });
  });
});

describe("faqJsonLd", () => {
  it("builds an FAQPage from question/answer pairs", () => {
    expect(faqJsonLd([{ question: "Q?", answer: "A." }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
    });
  });
});
```

Create `src/components/faq.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { faqs } from "@/content/site";
import { Faq } from "./faq";

type FaqPage = { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };

it("publishes FAQPage data that matches the questions on screen", () => {
  const { container } = render(<Faq />);
  const script = container.querySelector('script[type="application/ld+json"]');
  const data = JSON.parse(script?.textContent ?? "{}") as FaqPage;

  const shown = Array.from(container.querySelectorAll("details")).map((item) => ({
    question: item.querySelector("summary")?.textContent,
    answer: item.querySelector("p")?.textContent,
  }));

  expect(shown).toHaveLength(faqs.length);
  expect(data["@type"]).toBe("FAQPage");
  expect(data.mainEntity.map((entry) => ({ question: entry.name, answer: entry.acceptedAnswer.text }))).toEqual(shown);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/structured-data.test.ts src/components/faq.test.tsx`
Expected: FAIL, `Failed to resolve import "./structured-data"` and `"./faq"`.

- [ ] **Step 3: Implement structured data, the JSON-LD tag, and the FAQ**

Create `src/lib/structured-data.ts`:

```ts
import type { Faq } from "@/content/site";

/** JSON for a <script> tag: "<" is escaped so content can never close the tag early. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function faqJsonLd(items: readonly Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
```

Create `src/components/json-ld.tsx`:

```tsx
import { serializeJsonLd } from "@/lib/structured-data";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
```

Create `src/components/faq.tsx`:

```tsx
import { faqs } from "@/content/site";
import { faqJsonLd } from "@/lib/structured-data";
import { PlusIcon } from "./icons";
import { JsonLd } from "./json-ld";
import { focusRing, sectionHeading } from "./ui";

export function Faq() {
  return (
    <section aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <h2 id="faq-heading" className={sectionHeading}>
          Questions, answered
        </h2>
        <div className="mt-8 divide-y divide-eucalyptus border-y border-eucalyptus">
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary
                className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold text-canopy [&::-webkit-details-marker]:hidden ${focusRing}`}
              >
                {faq.question}
                <PlusIcon className="size-5 shrink-0 group-open:rotate-45 motion-safe:transition-transform" />
              </summary>
              <p className="max-w-[60ch] pb-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={faqJsonLd(faqs)} />
    </section>
  );
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/lib/structured-data.test.ts src/components/faq.test.tsx`
Expected: PASS.

- [ ] **Step 5: Add the remaining sections**

Create `src/components/proof.tsx`:

```tsx
import Image from "next/image";
import {
  beforeAfter,
  googleRating,
  owner,
  proofFallback,
  testimonials,
  trustBadges,
} from "@/content/site";
import { CheckIcon } from "./icons";
import { sectionHeading, sectionInner } from "./ui";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, "").charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Real reviews only. Until there are some, the owner and plain commitments carry the trust. */
export function Proof() {
  const hasReviews = googleRating !== null || testimonials.length > 0 || beforeAfter.length > 0;
  return (
    <section aria-labelledby="owner-heading" className="bg-paper">
      <div className={`${sectionInner} grid gap-14 md:grid-cols-2`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {owner.photo ? (
            <Image
              src={owner.photo.src}
              alt={owner.photo.alt}
              width={owner.photo.width}
              height={owner.photo.height}
              className="size-32 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-32 shrink-0 items-center justify-center rounded-2xl bg-eucalyptus font-display text-4xl font-bold text-canopy"
            >
              {initials(owner.name)}
            </div>
          )}
          <div>
            <h2 id="owner-heading" className={sectionHeading}>
              Meet the owner
            </h2>
            <p className="mt-2 font-display text-xl font-bold text-canopy">{owner.name}</p>
            <p className="mt-4 max-w-[55ch]">{owner.note}</p>
          </div>
        </div>
        {hasReviews ? <Reviews /> : <Commitments />}
      </div>
    </section>
  );
}

function Commitments() {
  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-canopy">{proofFallback.heading}</h3>
      {trustBadges.length > 0 ? (
        <ul className="mt-6 space-y-3 text-lg">
          {trustBadges.map((badge) => (
            <li key={badge} className="flex items-center gap-3">
              <CheckIcon className="size-6 shrink-0 text-canopy" />
              {badge}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-6 max-w-[50ch]">{proofFallback.body}</p>
    </div>
  );
}

function Reviews() {
  return (
    <div className="space-y-10">
      {googleRating ? (
        <p className="font-display text-3xl font-bold text-canopy">
          {googleRating.value.toFixed(1)} stars on Google
          <span className="mt-1 block font-sans text-base font-normal text-ink">
            from {googleRating.count} reviews
          </span>
        </p>
      ) : null}
      {testimonials.length > 0 ? (
        <ul className="space-y-8">
          {testimonials.map((testimonial) => (
            <li key={`${testimonial.name}-${testimonial.quote}`}>
              <blockquote className="text-lg">&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <p className="mt-2 font-bold text-canopy">
                {testimonial.name}, {testimonial.town}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {beforeAfter.map((item) => (
        <figure key={item.caption}>
          <div className="grid grid-cols-2 gap-2">
            <Image {...item.before} alt={item.before.alt} className="h-auto w-full rounded-xl" />
            <Image {...item.after} alt={item.after.alt} className="h-auto w-full rounded-xl" />
          </div>
          <figcaption className="mt-2 text-sm">{item.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
```

Create `src/components/final-cta.tsx`:

```tsx
import { requestQuote } from "@/app/actions/request-quote";
import { finalCta } from "@/content/site";
import { PhoneLink } from "./phone-link";
import { QuoteForm } from "./quote-form/quote-form";
import { sectionInner } from "./ui";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-canopy text-fog">
      <div className={`${sectionInner} grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:gap-12`}>
        <div>
          <h2 id="final-cta-heading" className="font-display text-3xl font-bold leading-tight md:text-5xl">
            {finalCta.heading}
          </h2>
          <p className="mt-4 max-w-[45ch] text-lg">{finalCta.body}</p>
          <p className="mt-6">
            Or call or text{" "}
            <PhoneLink className="font-bold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fog" />
          </p>
        </div>
        <QuoteForm id="final-quote" action={requestQuote} title="Tell us about your home" />
      </div>
    </section>
  );
}
```

Create `src/components/service-area.tsx`:

```tsx
import { TOWNS, serviceArea } from "@/content/site";
import { sectionHeading, sectionInner } from "./ui";

export function ServiceArea() {
  return (
    <section aria-labelledby="area-heading">
      <div className={`${sectionInner} grid gap-10 md:grid-cols-2 md:items-center`}>
        <div>
          <h2 id="area-heading" className={sectionHeading}>
            {serviceArea.heading}
          </h2>
          <p className="mt-4 max-w-[45ch]">{serviceArea.body}</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 font-bold text-canopy sm:grid-cols-3">
            {TOWNS.map((town) => (
              <li key={town}>{town}</li>
            ))}
          </ul>
        </div>
        <iframe
          title="Map of Marin County, California"
          src="https://www.google.com/maps?q=Marin+County,+CA&output=embed"
          width={600}
          height={400}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[3/2] h-auto w-full rounded-2xl border border-canopy/15"
        />
      </div>
    </section>
  );
}
```

Create `src/components/site-footer.tsx`:

```tsx
import Link from "next/link";
import { TOWNS, site } from "@/content/site";
import { PhoneLink } from "./phone-link";

const footerLink = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fog";

export function SiteFooter() {
  return (
    // Bottom padding on mobile keeps the sticky bar from covering the footer.
    <footer className="bg-canopy pb-24 text-fog md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl font-bold">{site.name}</p>
          <p className="mt-1 text-eucalyptus">{site.tagline}</p>
        </div>
        <div className="space-y-1">
          <p>
            Call or text <PhoneLink className={footerLink} />
          </p>
          <p>
            <a href={`mailto:${site.email}`} className={footerLink}>
              {site.email}
            </a>
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p>House cleaning in {TOWNS.join(", ")}, Marin County, California.</p>
          <p>
            <Link href="/privacy" className={footerLink}>
              Privacy policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Extend the page test with the CTA consistency checks**

Add `site` to the content import at the top of `src/app/page.test.tsx`, so it reads:

```tsx
import { hero, site } from "@/content/site";
```

Then add these tests inside the existing `describe("Home page", …)` block, after the last `it`:

```tsx
  it("points every quote CTA at the hero form and every phone link at one number", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll("[data-quote-form]")).toHaveLength(2);
    expect(container.querySelector("#quote[data-quote-form]")).not.toBeNull();

    const quoteLinks = Array.from(container.querySelectorAll('[data-cta="quote"]'));
    expect(quoteLinks.length).toBeGreaterThanOrEqual(6);
    for (const link of quoteLinks) expect(link).toHaveAttribute("href", "#quote");

    const phoneLinks = Array.from(container.querySelectorAll('a[href^="tel:"]'));
    expect(phoneLinks.length).toBeGreaterThanOrEqual(4);
    for (const link of phoneLinks) {
      expect(link).toHaveAttribute("href", `tel:${site.phone.tel}`);
      expect(link).toHaveAttribute("data-cta", "phone");
    }
  });

  it("links internally only to the privacy policy", () => {
    const { container } = render(<Home />);
    const internal = Array.from(container.querySelectorAll('a[href^="/"]')).map((link) => link.getAttribute("href"));
    expect(new Set(internal)).toEqual(new Set(["/privacy"]));
  });
```

- [ ] **Step 7: Assemble the full page**

Replace the whole of `src/app/page.tsx` with:

```tsx
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Problem } from "@/components/problem";
import { Proof } from "@/components/proof";
import { ServiceArea } from "@/components/service-area";
import { Services } from "@/components/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Services />
        <HowItWorks />
        <Proof />
        <Faq />
        <FinalCta />
        <ServiceArea />
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
```

- [ ] **Step 8: Run the page tests**

Run: `npx vitest run src/app/page.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 9: Verify lint, types, tests, and a static build**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build`
Expected: all clean; `○ /` static.

- [ ] **Step 10: Commit**

```bash
git add src/lib/structured-data.ts src/lib/structured-data.test.ts src/components src/app/page.tsx src/app/page.test.tsx
git commit -m "$(printf 'feat: add owner, FAQ, final CTA, service area, and footer sections\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 9: SEO metadata, LocalBusiness data, share image, robots, sitemap, icon, privacy page

**Files:**
- Modify: `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/lib/structured-data.ts`, `src/lib/structured-data.test.ts`, `src/app/page.tsx`, `src/app/page.test.tsx`
- Create: `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/icon.svg`, `src/app/privacy/page.tsx`
- Delete: `src/app/favicon.ico`

**Interfaces:**
- Consumes:
  - Task 1: content.
  - Task 4: `siteUrl`.
  - Task 7: `RIDGE_PATH`.
  - Task 8: `JsonLd`, `structured-data.ts`.
- Produces:
  - `seo.ts`: `PAGE_TITLE`, `PAGE_DESCRIPTION`, `pageMetadata: Metadata`.
  - `structured-data.ts`: `localBusinessJsonLd(origin: string)`.
  - The `/opengraph-image`, `/robots.txt`, `/sitemap.xml`, `/icon.svg` and `/privacy` routes.

- [ ] **Step 1: Write the failing metadata and LocalBusiness tests**

Add to `src/lib/seo.test.ts`. First replace its `./seo` import line with:

```ts
import { PAGE_DESCRIPTION, PAGE_TITLE, pageMetadata, siteUrl } from "./seo";
```

Then append:

```ts
describe("pageMetadata", () => {
  it("keeps the title within 50–60 characters with the keyword and brand", () => {
    expect(PAGE_TITLE.length).toBeGreaterThanOrEqual(50);
    expect(PAGE_TITLE.length).toBeLessThanOrEqual(60);
    expect(PAGE_TITLE).toContain("Marin County");
    expect(PAGE_TITLE).toContain(site.name);
    expect(pageMetadata.title).toBe(PAGE_TITLE);
  });

  it("keeps the description within 150–160 characters and names towns", () => {
    expect(PAGE_DESCRIPTION.length).toBeGreaterThanOrEqual(150);
    expect(PAGE_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(PAGE_DESCRIPTION).toContain("Marin County");
    expect(PAGE_DESCRIPTION).toContain("Mill Valley");
    expect(PAGE_DESCRIPTION).toContain("San Rafael");
    expect(pageMetadata.description).toBe(PAGE_DESCRIPTION);
  });

  it("sets the canonical URL and social cards", () => {
    expect(pageMetadata.alternates?.canonical).toBe("/");
    expect(pageMetadata.openGraph).toMatchObject({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: "/", siteName: site.name });
    expect(pageMetadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
```

Add to `src/lib/structured-data.test.ts`. First replace its `./structured-data` import line with these two lines:

```ts
import { TOWNS, site } from "@/content/site";
import { faqJsonLd, localBusinessJsonLd, serializeJsonLd } from "./structured-data";
```

Then append:

```ts
describe("localBusinessJsonLd", () => {
  it("describes the business and every town it serves", () => {
    const data = localBusinessJsonLd("https://marinshine.example");
    expect(data).toMatchObject({
      "@type": "LocalBusiness",
      name: site.name,
      url: "https://marinshine.example/",
      telephone: site.phone.tel,
    });
    expect(data.areaServed.map((place) => place.name)).toEqual(TOWNS.map((town) => `${town}, CA`));
    expect(data.makesOffer).toHaveLength(4);
  });
});
```

Add to `src/app/page.test.tsx`, inside the `describe` block:

```tsx
  it("describes the business to search engines", () => {
    const { container } = render(<Home />);
    const types = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
      (script) => (JSON.parse(script.textContent ?? "{}") as { "@type": string })["@type"],
    );
    expect(types).toEqual(expect.arrayContaining(["LocalBusiness", "FAQPage"]));
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/seo.test.ts src/lib/structured-data.test.ts src/app/page.test.tsx`
Expected: FAIL. `PAGE_TITLE`, `pageMetadata` and `localBusinessJsonLd` are not exported, and the page has no LocalBusiness script.

- [ ] **Step 3: Implement page metadata and LocalBusiness data**

Replace the whole of `src/lib/seo.ts` with:

```ts
import type { Metadata } from "next";
import { site } from "@/content/site";

/** Absolute site origin without a trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/+$/, "");
}

export const PAGE_TITLE = `House Cleaning in Marin County, CA | ${site.name}`;

export const PAGE_DESCRIPTION =
  "House cleaning in Mill Valley, San Rafael, Novato and all of Marin County. Get a free quote in under a minute, plus a free add-on with your first clean.";

export const pageMetadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};
```

In `src/lib/structured-data.ts`, change the first import line to:

```ts
import { TOWNS, services, site, type Faq } from "@/content/site";
```

and append:

```ts
/** A service-area business: no street address, the towns it serves instead. */
export function localBusinessJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${origin}/#business`,
    name: site.name,
    slogan: site.tagline,
    description:
      "House cleaning across Marin County, California: standard, deep, move-in/move-out, and vacation rental cleaning.",
    url: `${origin}/`,
    telephone: site.phone.tel,
    email: site.email,
    priceRange: site.priceRange,
    areaServed: TOWNS.map((town) => ({
      "@type": "City",
      name: `${town}, CA`,
      containedInPlace: { "@type": "AdministrativeArea", name: "Marin County, CA" },
    })),
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.name, description: service.summary },
    })),
  };
}
```

Edit `src/app/page.tsx`. Add these imports with the others:

```tsx
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { localBusinessJsonLd } from "@/lib/structured-data";
```

Add directly above `export default function Home()`:

```tsx
export const metadata = pageMetadata;
```

Then add `<JsonLd data={localBusinessJsonLd(siteUrl())} />` as the last child of the fragment, after `<StickyCta />`.

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run src/lib/seo.test.ts src/lib/structured-data.test.ts src/app/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Add the share image, robots, sitemap, and icon**

Create `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { RIDGE_PATH } from "@/components/ridge-line";
import { hero, site } from "@/content/site";

export const alt = `${site.name}: ${hero.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#EDF1EF",
          color: "#1E3D32",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>{site.name}</div>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 120 }}>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            {hero.headline}
          </div>
          <div style={{ display: "flex", fontSize: 36, marginTop: 24, color: "#24302B" }}>{site.tagline}</div>
        </div>
        <svg
          width="1200"
          height="160"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, bottom: 0 }}
        >
          <path d={RIDGE_PATH} fill="none" stroke="#8FAE9C" strokeWidth="4" />
        </svg>
      </div>
    ),
    size,
  );
}
```

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
```

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl()}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl()}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
```

Create `src/app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1E3D32"/>
  <path d="M6 46 C14 44 20 40 26 34 L30 28 C32 26 34 26 35 28 C38 32 40 32 43 28 L46 24 C48 22 50 22 52 25 C54 30 56 36 58 40" fill="none" stroke="#8FAE9C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

```bash
git rm -q src/app/favicon.ico
```

- [ ] **Step 6: Add the privacy page**

Create `src/app/privacy/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Privacy policy | ${site.name}`,
  description: `How ${site.name} collects, uses, and protects the details you send through our quote form.`,
  alternates: { canonical: "/privacy" },
};

// LAUNCH-BLOCKER: have this draft privacy policy reviewed before launch
export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
      <Link href="/" className="font-display text-xl font-bold text-canopy underline">
        {site.name}
      </Link>
      <h1 className="mt-10 font-display text-4xl font-bold text-canopy">Privacy policy</h1>
      <div className="mt-8 max-w-[65ch] space-y-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-canopy [&_p]:mt-2">
        <section>
          <h2>What we collect</h2>
          <p>
            When you request a quote, we collect what you enter: the service you need, your town, the size of your
            home, your name, phone number, email address, and any notes.
          </p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>We use it only to prepare your quote, contact you about it, and schedule and provide the cleaning you book.</p>
        </section>
        <section>
          <h2>Where it&apos;s stored</h2>
          <p>
            Quote requests are saved in a private Google Sheet and sent to our inbox through our email provider, Resend.
            If you came from a Google ad, Google may record that a quote request was completed.
          </p>
        </section>
        <section>
          <h2>Who we share it with</h2>
          <p>We don&apos;t sell or rent your information. We share it only with the services above, which handle it for us.</p>
        </section>
        <section>
          <h2>Your choices</h2>
          <p>
            You can ask what we hold about you, and ask us to correct or delete it. Email{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>{" "}
            or call {site.phone.display}.
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Build, then check the generated routes on a production server**

Run:

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
npx next start -p 3100 > .next/start.log 2>&1 &
SERVER=$!
curl -s --retry 20 --retry-connrefused --retry-delay 1 http://localhost:3100/robots.txt
curl -s http://localhost:3100/sitemap.xml
curl -s -o /dev/null -w "og-image: %{http_code} %{content_type}\n" http://localhost:3100/opengraph-image
curl -s http://localhost:3100/ | grep -oE '<(title|link rel="canonical"|meta property="og:image")[^>]*>' | head -5
curl -s -o /dev/null -w "privacy: %{http_code}\n" http://localhost:3100/privacy
kill $SERVER
```

Expected:
- `robots.txt` shows `User-Agent: *`, `Allow: /` and `Sitemap: https://www.example.com/sitemap.xml`.
- The sitemap lists `/` and `/privacy`.
- `og-image: 200 image/png`.
- The `<title>` is "House Cleaning in Marin County, CA | Marin Shine Co.", followed by the canonical and `og:image` tags.
- `privacy: 200`.
- The build route table shows `/`, `/privacy`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image` and `/icon.svg`, all static.

- [ ] **Step 8: Confirm the launch check still lists the placeholders**

Run: `npm run launch-check; echo "exit=$?"`
Expected: the content placeholders plus `src/app/privacy/page.tsx: LAUNCH-BLOCKER: have this draft privacy policy reviewed before launch`, then `exit=1`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/lib/structured-data.ts src/lib/structured-data.test.ts src/app
git commit -m "$(printf 'feat: add SEO metadata, LocalBusiness data, share image, sitemap, and privacy page\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

## After the plan

These steps come from the landing-page-generator workflow; they are not tasks for the implementer:
- **Phase 6, parallel audits:** performance on a production build, the conversion checklist, and SEO plus accessibility.
- **Phase 8, code review.**
- **Phase 9, verification:** screenshots at 375×667 and 1440×900 showing the H1 and the step 1 **Next** button above the fold, plus one real end-to-end submission the owner confirms.
- **Phase 10, finishing the branch.**
