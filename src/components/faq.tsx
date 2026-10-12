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
