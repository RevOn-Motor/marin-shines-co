import { services, servicesIntro } from "@/content/site";
import { CheckIcon } from "./icons";
import { QuoteLink } from "./quote-link";
import { primaryButton, sectionHeading, sectionInner } from "./ui";

/** Laid out as a price list (rows and rules), not a grid of cards. */
export function Services() {
  return (
    <section aria-labelledby="services-heading" className="bg-paper">
      <div className={sectionInner}>
        <h2 id="services-heading" className={`${sectionHeading} max-w-[22ch]`}>
          {servicesIntro.heading}
        </h2>
        <p className="mt-4 max-w-[60ch]">{servicesIntro.body}</p>
        <ul className="mt-10 divide-y divide-eucalyptus border-y border-eucalyptus">
          {services.map((service) => (
            <li
              key={service.id}
              className="grid gap-4 py-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-start md:gap-10"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-canopy">{service.name}</h3>
                <p className="mt-1 font-bold">{service.startingPrice}</p>
              </div>
              <div>
                <p>{service.summary}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {service.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckIcon className="mt-1 size-5 shrink-0 text-canopy" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <QuoteLink service={service.id} className={`${primaryButton} w-full md:w-auto md:self-center`}>
                Get a quote<span className="sr-only"> for {service.name.toLowerCase()}</span>
              </QuoteLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
