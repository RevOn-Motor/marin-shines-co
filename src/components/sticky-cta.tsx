"use client";

import { useEffect, useState } from "react";
import { PhoneIcon } from "./icons";
import { PhoneLink } from "./phone-link";
import { QuoteLink } from "./quote-link";
import { primaryButton, secondaryButton } from "./ui";

/** Mobile-only bar that appears after the hero form and hides while any quote form is on screen. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const forms = Array.from(document.querySelectorAll("[data-quote-form]"));
    if (forms.length === 0) return;

    const latest = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) latest.set(entry.target, entry);
      const formOnScreen = Array.from(latest.values()).some((entry) => entry.isIntersecting);
      const heroEntry = latest.get(forms[0]);
      const pastHero = heroEntry !== undefined && heroEntry.boundingClientRect.bottom < 0;
      setVisible(pastHero && !formOnScreen);
    });
    forms.forEach((form) => observer.observe(form));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-sticky-cta
      data-visible={visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-canopy/15 bg-paper p-3 md:hidden motion-safe:transition-transform ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <QuoteLink className={`${primaryButton} flex-1`}>Get my free quote</QuoteLink>
      <PhoneLink className={secondaryButton}>
        <PhoneIcon className="size-5" />
        Call
      </PhoneLink>
    </div>
  );
}
