import { site } from "@/content/site";

/** Absolute site origin without a trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/+$/, "");
}
