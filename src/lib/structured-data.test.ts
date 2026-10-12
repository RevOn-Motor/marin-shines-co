import { describe, expect, it } from "vitest";
import { TOWNS, site } from "@/content/site";
import { faqJsonLd, localBusinessJsonLd, serializeJsonLd } from "./structured-data";

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
