import { TOWNS, serviceArea } from "@/content/site";
import { sectionHeading, sectionInner } from "./ui";

export function ServiceArea() {
  return (
    <section aria-labelledby="area-heading">
      <div className={`${sectionInner} grid gap-10 md:grid-cols-2 md:items-center`}>
        <div>
          <h2 id="area-heading" className={sectionHeading}>
            {serviceArea.heading}
          </h2>
          <p className="mt-4 max-w-[45ch]">{serviceArea.body}</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 font-bold text-canopy sm:grid-cols-3">
            {TOWNS.map((town) => (
              <li key={town}>{town}</li>
            ))}
          </ul>
        </div>
        <iframe
          title="Map of Marin County, California"
          src="https://www.google.com/maps?q=Marin+County,+CA&output=embed"
          width={600}
          height={400}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[3/2] h-auto w-full rounded-2xl border border-canopy/15"
        />
      </div>
    </section>
  );
}
