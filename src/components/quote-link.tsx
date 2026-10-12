"use client";

import type { MouseEvent, ReactNode } from "react";
import type { ServiceId } from "@/content/site";
import { nearestIndex, selectService } from "@/lib/quote-events";

type QuoteLinkProps = { service?: ServiceId; className?: string; children: ReactNode };

/** Every quote CTA. Without JavaScript it is a plain link to the hero form (#quote). */
export function QuoteLink({ service, className, children }: QuoteLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-quote-form]"));
    if (forms.length === 0) return;
    event.preventDefault();

    if (service) selectService(service);
    const target = forms[nearestIndex(forms.map((form) => form.getBoundingClientRect().top))];
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    target.querySelector<HTMLElement>("[data-quote-focus]")?.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <a href="#quote" data-cta="quote" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
