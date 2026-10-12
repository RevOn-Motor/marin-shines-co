import Image from "next/image";
import {
  beforeAfter,
  googleRating,
  owner,
  proofFallback,
  testimonials,
  trustBadges,
} from "@/content/site";
import { CheckIcon } from "./icons";
import { sectionHeading, sectionInner } from "./ui";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, "").charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Real reviews only. Until there are some, the owner and plain commitments carry the trust. */
export function Proof() {
  const hasReviews = googleRating !== null || testimonials.length > 0 || beforeAfter.length > 0;
  return (
    <section aria-labelledby="owner-heading" className="bg-paper">
      <div className={`${sectionInner} grid gap-14 md:grid-cols-2`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {owner.photo ? (
            <Image
              src={owner.photo.src}
              alt={owner.photo.alt}
              width={owner.photo.width}
              height={owner.photo.height}
              className="size-32 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-32 shrink-0 items-center justify-center rounded-2xl bg-eucalyptus font-display text-4xl font-bold text-canopy"
            >
              {initials(owner.name)}
            </div>
          )}
          <div>
            <h2 id="owner-heading" className={sectionHeading}>
              Meet the owner
            </h2>
            <p className="mt-2 font-display text-xl font-bold text-canopy">{owner.name}</p>
            <p className="mt-4 max-w-[55ch]">{owner.note}</p>
          </div>
        </div>
        {hasReviews ? <Reviews /> : <Commitments />}
      </div>
    </section>
  );
}

function Commitments() {
  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-canopy">{proofFallback.heading}</h3>
      {trustBadges.length > 0 ? (
        <ul className="mt-6 space-y-3 text-lg">
          {trustBadges.map((badge) => (
            <li key={badge} className="flex items-center gap-3">
              <CheckIcon className="size-6 shrink-0 text-canopy" />
              {badge}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-6 max-w-[50ch]">{proofFallback.body}</p>
    </div>
  );
}

function Reviews() {
  return (
    <div className="space-y-10">
      {googleRating ? (
        <p className="font-display text-3xl font-bold text-canopy">
          {googleRating.value.toFixed(1)} stars on Google
          <span className="mt-1 block font-sans text-base font-normal text-ink">
            from {googleRating.count} reviews
          </span>
        </p>
      ) : null}
      {testimonials.length > 0 ? (
        <ul className="space-y-8">
          {testimonials.map((testimonial) => (
            <li key={`${testimonial.name}-${testimonial.quote}`}>
              <blockquote className="text-lg">&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <p className="mt-2 font-bold text-canopy">
                {testimonial.name}, {testimonial.town}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {beforeAfter.map((item) => (
        <figure key={item.caption}>
          <div className="grid grid-cols-2 gap-2">
            <Image {...item.before} alt={item.before.alt} className="h-auto w-full rounded-xl" />
            <Image {...item.after} alt={item.after.alt} className="h-auto w-full rounded-xl" />
          </div>
          <figcaption className="mt-2 text-sm">{item.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
