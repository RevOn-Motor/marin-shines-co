import type { ServiceId } from "@/content/site";

/** Fired on window when a "Get a quote" link picks a service; every quote form listens. */
export const QUOTE_SELECT_EVENT = "quote:select";
export type QuoteSelectDetail = { service: ServiceId };

export function selectService(service: ServiceId): void {
  window.dispatchEvent(new CustomEvent<QuoteSelectDetail>(QUOTE_SELECT_EVENT, { detail: { service } }));
}
