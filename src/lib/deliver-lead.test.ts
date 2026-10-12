// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { deliverLead, formatPacificTime, type DeliveryEnv } from "./deliver-lead";
import type { Lead } from "./lead";

const lead: Lead = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "4155550123",
  email: "jane@example.com",
  notes: "",
  source: "quote",
};

const bothConfigured: DeliveryEnv = {
  NODE_ENV: "production",
  LEADS_SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/abc/exec",
  LEADS_SHEET_SECRET: "s3cret",
  RESEND_API_KEY: "re_test",
  LEAD_EMAIL_TO: "owner@example.com",
  LEAD_EMAIL_FROM: "Marin Shine Co. <leads@example.com>",
};

type Handler = () => Promise<Response>;
const sheetOk: Handler = async () => Response.json({ ok: true });
const emailOk: Handler = async () => Response.json({ id: "email_1" });
const serverError: Handler = async () => new Response("boom", { status: 500 });
const hang: Handler = () => new Promise<Response>(() => {});

/** Routes Resend calls to `email` and everything else to `sheet`, honoring abort signals. */
function makeFetch(sheet: Handler, email: Handler) {
  return vi.fn<typeof fetch>(
    (input, init) =>
      new Promise<Response>((resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        const handler = String(input).startsWith("https://api.resend.com") ? email : sheet;
        handler().then(resolve, reject);
      }),
  );
}

function makeDeps(fetchFn: ReturnType<typeof makeFetch>, env: DeliveryEnv = bothConfigured) {
  return {
    env,
    fetch: fetchFn,
    log: { info: vi.fn(), error: vi.fn() },
    now: () => new Date("2026-10-12T17:05:00Z"),
    timeoutMs: 50,
  };
}

describe("formatPacificTime", () => {
  it("shows the owner's local time", () => {
    expect(formatPacificTime(new Date("2026-10-12T17:05:00Z"))).toBe("Oct 12, 2026, 10:05 PT");
  });
});

describe("deliverLead", () => {
  it("succeeds when both destinations accept the lead", async () => {
    const deps = makeDeps(makeFetch(sheetOk, emailOk));
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.fetch).toHaveBeenCalledTimes(2);
    expect(deps.log.error).not.toHaveBeenCalled();
  });

  it("succeeds when only the email gets through, and logs the Sheet failure", async () => {
    const deps = makeDeps(makeFetch(serverError, emailOk));
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.log.error).toHaveBeenCalledWith("Lead delivery to Google Sheet failed:", expect.any(Error));
  });

  it("fails when both destinations fail, and logs the lead so it can be recovered", async () => {
    const deps = makeDeps(makeFetch(serverError, serverError));
    expect(await deliverLead(lead, deps)).toEqual({ ok: false });
    expect(deps.log.error).toHaveBeenCalledWith("Lead NOT delivered to any destination. Lead:", lead);
  });

  it("only calls the destinations that are configured", async () => {
    const env: DeliveryEnv = {
      NODE_ENV: "production",
      LEADS_SHEET_WEBHOOK_URL: bothConfigured.LEADS_SHEET_WEBHOOK_URL,
      LEADS_SHEET_SECRET: "s3cret",
    };
    const deps = makeDeps(makeFetch(sheetOk, emailOk), env);
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
    expect(String(deps.fetch.mock.calls[0][0])).toContain("script.google.com");
  });

  it("fails in production when no destination is configured", async () => {
    const deps = makeDeps(makeFetch(sheetOk, emailOk), { NODE_ENV: "production" });
    expect(await deliverLead(lead, deps)).toEqual({ ok: false });
    expect(deps.fetch).not.toHaveBeenCalled();
    expect(deps.log.error).toHaveBeenCalledWith("Lead NOT delivered: no lead destination is configured. Lead:", lead);
  });

  it("logs the lead and succeeds in development when no destination is configured", async () => {
    const deps = makeDeps(makeFetch(sheetOk, emailOk), { NODE_ENV: "development" });
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.fetch).not.toHaveBeenCalled();
    expect(deps.log.info).toHaveBeenCalledWith("[dev] No lead destination configured. Lead:", lead);
  });

  it("gives up on a hanging destination and still succeeds via the other", async () => {
    const deps = makeDeps(makeFetch(hang, emailOk));
    expect(await deliverLead(lead, deps)).toEqual({ ok: true });
    expect(deps.log.error).toHaveBeenCalledWith("Lead delivery to Google Sheet failed:", expect.anything());
  });

  it("fails when every destination hangs", async () => {
    const deps = makeDeps(makeFetch(hang, hang));
    expect(await deliverLead(lead, deps)).toEqual({ ok: false });
  });
});
