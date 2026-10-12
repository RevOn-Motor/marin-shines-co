declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendConversion(sendTo: string | undefined): boolean {
  if (!sendTo || typeof window === "undefined" || typeof window.gtag !== "function") return false;
  try {
    window.gtag("event", "conversion", { send_to: sendTo });
    return true;
  } catch {
    // A broken or blocked tag must never get in the way of a lead.
    return false;
  }
}

// process.env.NEXT_PUBLIC_* must be written out literally so Next inlines it at build time.

/** Call only after a quote request was delivered. */
export function trackLeadConversion(): boolean {
  return sendConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO);
}

export function trackPhoneClick(): boolean {
  return sendConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO);
}
