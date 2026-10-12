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
        <QuoteForm id="final-quote" action={requestQuote} title="Tell us about your home" titleAs="h3" />
      </div>
    </section>
  );
}
