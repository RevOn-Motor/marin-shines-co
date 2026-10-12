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
