import { TOWNS, services, site, type Faq } from "@/content/site";

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
