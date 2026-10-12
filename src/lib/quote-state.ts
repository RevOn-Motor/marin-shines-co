import { site } from "@/content/site";
import type { FieldErrors } from "./lead";

// Shared by the Server Action and the client form, so it must stay free of server-only code.

export type QuoteState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors: FieldErrors };

export type QuoteAction = (previous: QuoteState, formData: FormData) => Promise<QuoteState>;

export const initialQuoteState: QuoteState = { status: "idle" };

export const DELIVERY_FAILED_MESSAGE = `We couldn't send your request. Try again, or call or text ${site.phone.display}.`;
export const INVALID_MESSAGE = "Check the highlighted fields and try again.";
