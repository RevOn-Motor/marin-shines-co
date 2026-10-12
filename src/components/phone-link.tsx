"use client";

import type { ReactNode } from "react";
import { site } from "@/content/site";
import { trackPhoneClick } from "@/lib/tracking";

export function PhoneLink({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a href={`tel:${site.phone.tel}`} data-cta="phone" onClick={() => trackPhoneClick()} className={className}>
      {children ?? site.phone.display}
    </a>
  );
}
