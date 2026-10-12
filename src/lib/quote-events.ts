import type { ServiceId } from "@/content/site";

/** Fired on window when a "Get a quote" link picks a service; every quote form listens. */
export const QUOTE_SELECT_EVENT = "quote:select";
export type QuoteSelectDetail = { service: ServiceId };

export function selectService(service: ServiceId): void {
  window.dispatchEvent(new CustomEvent<QuoteSelectDetail>(QUOTE_SELECT_EVENT, { detail: { service } }));
}

/** Index of the element whose top edge is closest to the top of the viewport. */
export function nearestIndex(tops: number[]): number {
  let best = -1;
  let bestDistance = Infinity;
  tops.forEach((top, index) => {
    const distance = Math.abs(top);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}
