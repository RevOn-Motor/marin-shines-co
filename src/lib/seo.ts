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
