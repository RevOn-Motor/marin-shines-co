"use server";

import { handleQuoteRequest } from "@/lib/quote-request";
import type { QuoteState } from "@/lib/quote-state";

export async function requestQuote(_previous: QuoteState, formData: FormData): Promise<QuoteState> {
  return handleQuoteRequest(formData, {
    env: process.env,
    fetch,
    log: console,
    now: () => new Date(),
  });
}
