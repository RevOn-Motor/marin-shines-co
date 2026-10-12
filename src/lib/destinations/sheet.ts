import { formatPhone, serviceName, type Lead } from "../lead";

export type SheetConfig = { url: string; secret: string };

export function sheetConfigFromEnv(env: {
  LEADS_SHEET_WEBHOOK_URL?: string;
  LEADS_SHEET_SECRET?: string;
}): SheetConfig | null {
  const url = env.LEADS_SHEET_WEBHOOK_URL?.trim();
  const secret = env.LEADS_SHEET_SECRET?.trim();
  return url && secret ? { url, secret } : null;
}

/** Google Sheets runs cells starting with = + - @ as formulas; a leading ' keeps them as text. */
export function asSheetText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/**
 * Appends the lead as one row through the Apps Script web app in docs/google-apps-script.gs.
 * Apps Script always answers HTTP 200, so success is the JSON body `{ ok: true }` and nothing else.
 */
export async function appendToSheet(
  lead: Lead,
  submittedAt: string,
  config: SheetConfig,
  fetchFn: typeof fetch,
  timeoutMs: number,
): Promise<void> {
  const response = await fetchFn(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: config.secret,
      submittedAt,
      service: serviceName(lead.service),
      town: lead.town,
      bedrooms: lead.bedrooms,
      bathrooms: lead.bathrooms,
      name: asSheetText(lead.name),
      phone: formatPhone(lead.phone),
      email: asSheetText(lead.email),
      notes: asSheetText(lead.notes),
      source: lead.source,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Sheet webhook responded ${response.status}`);

  const body: unknown = await response.json().catch(() => null);
  const accepted = typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
  if (!accepted) throw new Error(`Sheet webhook rejected the lead: ${JSON.stringify(body)}`);
}
