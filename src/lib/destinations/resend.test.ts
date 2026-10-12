// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Lead } from "../lead";
import { emailLead, leadEmail, resendConfigFromEnv } from "./resend";

const config = { apiKey: "re_test", from: "Marin Shine Co. <leads@example.com>", to: ["owner@example.com"] };
const lead: Lead = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "4155550123",
  email: "jane@example.com",
  notes: "Two cats.",
  source: "quote",
};

describe("resendConfigFromEnv", () => {
  it("splits a comma-separated recipient list", () => {
    expect(
      resendConfigFromEnv({
        RESEND_API_KEY: "re_test",
        LEAD_EMAIL_FROM: config.from,
        LEAD_EMAIL_TO: "owner@example.com, partner@example.com",
      }),
    ).toEqual({ ...config, to: ["owner@example.com", "partner@example.com"] });
  });

  it("is null when the key, sender, or recipient is missing", () => {
    expect(resendConfigFromEnv({ LEAD_EMAIL_FROM: config.from, LEAD_EMAIL_TO: "a@b.co" })).toBeNull();
    expect(resendConfigFromEnv({ RESEND_API_KEY: "k", LEAD_EMAIL_TO: "a@b.co" })).toBeNull();
    expect(resendConfigFromEnv({ RESEND_API_KEY: "k", LEAD_EMAIL_FROM: config.from, LEAD_EMAIL_TO: " , " })).toBeNull();
  });
});

describe("leadEmail", () => {
  it("names the job in the subject and lists every field in the body", () => {
    const { subject, text } = leadEmail(lead, "Oct 12, 2026, 10:05 PT");
    expect(subject).toBe("New quote request: Deep cleaning in Mill Valley");
    expect(text).toContain("Service:   Deep cleaning");
    expect(text).toContain("Bathrooms: 2");
    expect(text).toContain("Phone:     (415) 555-0123");
    expect(text).toContain("Email:     jane@example.com");
    expect(text).toContain("Notes:     Two cats.");
    expect(text).toContain("Form:      quote");
    expect(text).toContain("Received:  Oct 12, 2026, 10:05 PT");
    expect(text).toContain("Reply to this email to answer Jane Doe directly.");
  });

  it("says (none) when there are no notes", () => {
    expect(leadEmail({ ...lead, notes: "" }, "t").text).toContain("Notes:     (none)");
  });
});

describe("emailLead", () => {
  it("sends a plain-text email through Resend with reply-to set to the customer", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => Response.json({ id: "email_1" }));
    await emailLead(lead, "Oct 12, 2026, 10:05 PT", config, fetchFn, 1000);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ Authorization: "Bearer re_test", "Content-Type": "application/json" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({
      from: config.from,
      to: ["owner@example.com"],
      reply_to: "jane@example.com",
      subject: "New quote request: Deep cleaning in Mill Valley",
      text: leadEmail(lead, "Oct 12, 2026, 10:05 PT").text,
    });
  });

  it("throws with the status and body when Resend refuses", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response("domain not verified", { status: 403 }));
    await expect(emailLead(lead, "t", config, fetchFn, 1000)).rejects.toThrow("Resend responded 403: domain not verified");
  });
});
