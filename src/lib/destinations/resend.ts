import { formatPhone, serviceName, type Lead } from "../lead";

export type ResendConfig = { apiKey: string; from: string; to: string[] };

export function resendConfigFromEnv(env: {
  RESEND_API_KEY?: string;
  LEAD_EMAIL_FROM?: string;
  LEAD_EMAIL_TO?: string;
}): ResendConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.LEAD_EMAIL_FROM?.trim();
  const to = (env.LEAD_EMAIL_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return apiKey && from && to.length > 0 ? { apiKey, from, to } : null;
}

/** Plain text only: customer input is never placed into HTML. */
export function leadEmail(lead: Lead, submittedAt: string): { subject: string; text: string } {
  const rows: [string, string][] = [
    ["Service", serviceName(lead.service)],
    ["Town", lead.town],
    ["Bedrooms", lead.bedrooms],
    ["Bathrooms", lead.bathrooms],
    ["Name", lead.name],
    ["Phone", formatPhone(lead.phone)],
    ["Email", lead.email],
    ["Notes", lead.notes || "(none)"],
    ["Form", lead.source],
    ["Received", submittedAt],
  ];
  const text = [
    "New quote request from the website.",
    "",
    ...rows.map(([label, value]) => `${`${label}:`.padEnd(11)}${value}`),
    "",
    `Reply to this email to answer ${lead.name} directly.`,
  ].join("\n");
  return { subject: `New quote request: ${serviceName(lead.service)} in ${lead.town}`, text };
}

export async function emailLead(
  lead: Lead,
  submittedAt: string,
  config: ResendConfig,
  fetchFn: typeof fetch,
  timeoutMs: number,
): Promise<void> {
  const { subject, text } = leadEmail(lead, submittedAt);
  const response = await fetchFn("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.from, to: config.to, reply_to: lead.email, subject, text }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend responded ${response.status}: ${detail}`);
  }
}
