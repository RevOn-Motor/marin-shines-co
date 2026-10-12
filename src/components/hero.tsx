import { requestQuote } from "@/app/actions/request-quote";
import { hero } from "@/content/site";
import { QuoteForm } from "./quote-form/quote-form";
import { RidgeLine } from "./ridge-line";
import { TrustBadges } from "./trust-badges";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 pb-28 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:gap-x-12 md:gap-y-8 md:px-8 md:pb-44 md:pt-12">
        <div className="md:col-start-1 md:row-start-1">
          <h1
            id="hero-heading"
            className="max-w-[16ch] font-display text-[2rem] font-bold leading-[1.1] text-canopy md:text-[4rem]"
          >
            {hero.headline}
          </h1>
          <p className="mt-3 max-w-[40ch] md:mt-6 md:text-xl">
            <span className="md:hidden">{hero.subheadShort}</span>
            <span className="hidden md:inline">{hero.subhead}</span>
          </p>
        </div>
        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <QuoteForm id="quote" action={requestQuote} title="Get your free quote" />
        </div>
        <TrustBadges className="md:col-start-1 md:row-start-2 md:self-start" />
      </div>
      <RidgeLine className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-eucalyptus md:h-36" />
    </section>
  );
}
