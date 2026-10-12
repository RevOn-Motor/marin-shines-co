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
