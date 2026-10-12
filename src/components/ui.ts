// Shared class lists, so every quote button, field, and section looks and behaves the same.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy";

export const primaryButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-poppy px-6 text-lg font-bold text-canopy hover:bg-poppy-light disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`;

export const secondaryButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-canopy px-5 font-bold text-canopy hover:bg-paper ${focusRing}`;

export const fieldControl = `mt-1 block min-h-12 w-full min-w-0 rounded-[10px] border border-canopy/60 bg-paper px-3 text-base text-ink aria-[invalid=true]:border-2 aria-[invalid=true]:border-alert ${focusRing}`;

export const formCard =
  "relative scroll-mt-4 rounded-2xl border border-canopy/15 bg-paper p-4 text-ink md:p-6";

export const sectionInner = "mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24";

export const sectionHeading =
  "font-display text-3xl font-bold leading-tight text-canopy md:text-5xl";
