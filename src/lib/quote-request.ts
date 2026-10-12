import { deliverLead, type DeliveryDeps } from "./deliver-lead";
import { parseLeadForm, validateLead } from "./lead";
import { DELIVERY_FAILED_MESSAGE, INVALID_MESSAGE, type QuoteState } from "./quote-state";

export async function handleQuoteRequest(formData: FormData, deps: DeliveryDeps): Promise<QuoteState> {
  const input = parseLeadForm(formData);
  if (input.honeypot.trim() !== "") {
    deps.log.info("Honeypot field was filled; submission dropped. Input:", input);
    return { status: "success" };
  }

  const result = validateLead(input);
  if (!result.ok) return { status: "error", message: INVALID_MESSAGE, fieldErrors: result.fieldErrors };

  const { ok } = await deliverLead(result.lead, deps);
  return ok ? { status: "success" } : { status: "error", message: DELIVERY_FAILED_MESSAGE, fieldErrors: {} };
}
