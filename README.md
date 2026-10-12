# Marin Shine Co. landing page

A single-page house-cleaning landing page for Marin County, CA, with a two-step quote form that sends each lead to a Google Sheet and by email. Built with Next.js, React, Tailwind CSS v4, and Vitest.

## Commands

```bash
npm run dev           # dev server at http://localhost:3000
npm test              # run the test suite
npm run lint          # ESLint
npm run build         # production build (also type-checks)
npm run launch-check  # list every LAUNCH-BLOCKER placeholder still in the code
```

## Where things live

- Page copy and business facts: `src/content/site.ts`
- Lead setup (Google Sheet, email, Google Ads, launch checklist): `docs/lead-setup.md`
- Environment variables: `.env.example` (copy to `.env.local`)

Placeholders are marked `LAUNCH-BLOCKER:` and must all be replaced before launch.
