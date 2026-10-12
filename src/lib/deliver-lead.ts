import { appendToSheet, sheetConfigFromEnv } from "./destinations/sheet";
import { emailLead, resendConfigFromEnv } from "./destinations/resend";
import type { Lead } from "./lead";

export type DeliveryEnv = Partial<
  Record<
    | "NODE_ENV"
    | "RESEND_API_KEY"
    | "LEAD_EMAIL_TO"
    | "LEAD_EMAIL_FROM"
    | "LEADS_SHEET_WEBHOOK_URL"
    | "LEADS_SHEET_SECRET",
    string
  >
>;

export type DeliveryDeps = {
  env: DeliveryEnv;
  fetch: typeof fetch;
  log: Pick<Console, "info" | "error">;
  now: () => Date;
  /** Per destination. Defaults to 10 seconds. */
  timeoutMs?: number;
};

const pacificTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatPacificTime(date: Date): string {
  return `${pacificTime.format(date)} PT`;
}

/**
 * Sends the lead to every configured destination at once. The lead counts as delivered
 * when at least one destination accepts it; every failure is logged.
 */
export async function deliverLead(lead: Lead, deps: DeliveryDeps): Promise<{ ok: boolean }> {
  const submittedAt = formatPacificTime(deps.now());
  const timeoutMs = deps.timeoutMs ?? 10_000;
  const destinations: { name: string; send: () => Promise<void> }[] = [];

  const sheet = sheetConfigFromEnv(deps.env);
  if (sheet) {
    destinations.push({
      name: "Google Sheet",
      send: () => appendToSheet(lead, submittedAt, sheet, deps.fetch, timeoutMs),
    });
  }
  const resend = resendConfigFromEnv(deps.env);
  if (resend) {
    destinations.push({
      name: "Resend email",
      send: () => emailLead(lead, submittedAt, resend, deps.fetch, timeoutMs),
    });
  }

  if (destinations.length === 0) {
    if (deps.env.NODE_ENV === "production") {
      deps.log.error("Lead NOT delivered: no lead destination is configured. Lead:", lead);
      return { ok: false };
    }
    deps.log.info("[dev] No lead destination configured. Lead:", lead);
    return { ok: true };
  }

  const results = await Promise.allSettled(destinations.map((destination) => destination.send()));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      deps.log.error(`Lead delivery to ${destinations[index].name} failed:`, result.reason);
    }
  });
  const ok = results.some((result) => result.status === "fulfilled");
  if (!ok) deps.log.error("Lead NOT delivered to any destination. Lead:", lead);
  return { ok };
}
