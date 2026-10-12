// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { DeliveryEnv } from "./deliver-lead";
import { handleQuoteRequest } from "./quote-request";
import { DELIVERY_FAILED_MESSAGE, INVALID_MESSAGE } from "./quote-state";

const valid = {
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "Jane Doe",
  phone: "415-555-0123",
  email: "jane@example.com",
  notes: "",
  honeypot: "",
  source: "quote",
};

const configured: DeliveryEnv = {
  NODE_ENV: "production",
  RESEND_API_KEY: "re_test",
  LEAD_EMAIL_TO: "owner@example.com",
  LEAD_EMAIL_FROM: "Marin Shine Co. <leads@example.com>",
};

function form(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.append(key, value);
  return formData;
}

function makeDeps(env: DeliveryEnv, fetchFn = vi.fn<typeof fetch>(async () => Response.json({ id: "email_1" }))) {
  return { env, fetch: fetchFn, log: { info: vi.fn(), error: vi.fn() }, now: () => new Date("2026-10-12T17:05:00Z") };
}

describe("handleQuoteRequest", () => {
  it("delivers a valid request and reports success", async () => {
    const deps = makeDeps(configured);
    expect(await handleQuoteRequest(form(valid), deps)).toEqual({ status: "success" });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns field errors and delivers nothing when the input is invalid", async () => {
    const deps = makeDeps(configured);
    expect(await handleQuoteRequest(form({ ...valid, phone: "123" }), deps)).toEqual({
      status: "error",
      message: INVALID_MESSAGE,
      fieldErrors: { phone: "Enter a 10-digit phone number." },
    });
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it("pretends success for bots that fill the honeypot, and delivers nothing", async () => {
    const deps = makeDeps(configured);
    expect(await handleQuoteRequest(form({ ...valid, honeypot: "Acme" }), deps)).toEqual({ status: "success" });
    expect(deps.fetch).not.toHaveBeenCalled();
    expect(deps.log.info).toHaveBeenCalledWith(
      "Honeypot field was filled; submission dropped. Input:",
      expect.objectContaining({ name: "Jane Doe", email: "jane@example.com" }),
    );
  });

  it("returns the call-us message when no destination accepts the lead", async () => {
    const deps = makeDeps(configured, vi.fn<typeof fetch>(async () => new Response("down", { status: 503 })));
    expect(await handleQuoteRequest(form(valid), deps)).toEqual({
      status: "error",
      message: DELIVERY_FAILED_MESSAGE,
      fieldErrors: {},
    });
  });
});
