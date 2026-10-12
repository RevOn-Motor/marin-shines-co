// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Lead } from "../lead";
import { appendToSheet, asSheetText, sheetConfigFromEnv } from "./sheet";

const URL = "https://script.google.com/macros/s/abc/exec";
const config = { url: URL, secret: "s3cret" };
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

function respondWith(response: Response) {
  return vi.fn<typeof fetch>(async () => response);
}

describe("sheetConfigFromEnv", () => {
  it("needs both the URL and the secret", () => {
    expect(sheetConfigFromEnv({ LEADS_SHEET_WEBHOOK_URL: URL, LEADS_SHEET_SECRET: "s3cret" })).toEqual(config);
    expect(sheetConfigFromEnv({ LEADS_SHEET_WEBHOOK_URL: URL })).toBeNull();
    expect(sheetConfigFromEnv({ LEADS_SHEET_WEBHOOK_URL: " ", LEADS_SHEET_SECRET: "s3cret" })).toBeNull();
  });
});

describe("appendToSheet", () => {
  it("posts one row of JSON with the secret and readable values", async () => {
    const fetchFn = respondWith(Response.json({ ok: true }));
    await appendToSheet(lead, "Oct 12, 2026, 10:05 PT", config, fetchFn, 1000);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe(URL);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(init?.body))).toEqual({
      secret: "s3cret",
      submittedAt: "Oct 12, 2026, 10:05 PT",
      service: "Deep cleaning",
      town: "Mill Valley",
      bedrooms: "3",
      bathrooms: "2",
      name: "Jane Doe",
      phone: "(415) 555-0123",
      email: "jane@example.com",
      notes: "Two cats.",
      source: "quote",
    });
  });

  it("rejects a non-2xx response", async () => {
    const fetchFn = respondWith(new Response("nope", { status: 500 }));
    await expect(appendToSheet(lead, "t", config, fetchFn, 1000)).rejects.toThrow("Sheet webhook responded 500");
  });

  it("rejects a 200 response that says ok:false", async () => {
    const fetchFn = respondWith(Response.json({ ok: false, error: "unauthorized" }));
    await expect(appendToSheet(lead, "t", config, fetchFn, 1000)).rejects.toThrow("Sheet webhook rejected the lead");
  });

  it("rejects an HTML sign-in page", async () => {
    const page = new Response("<!DOCTYPE html><title>Sign in</title>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
    await expect(appendToSheet(lead, "t", config, respondWith(page), 1000)).rejects.toThrow(
      "Sheet webhook rejected the lead",
    );
  });

  it("stores formula-looking text as plain text", async () => {
    const fetchFn = respondWith(Response.json({ ok: true }));
    const risky = { ...lead, name: '=HYPERLINK("https://evil.example","x")', notes: "+1 call first" };
    await appendToSheet(risky, "t", config, fetchFn, 1000);

    const body = JSON.parse(String(fetchFn.mock.calls[0][1]?.body));
    expect(body.name).toBe(`'=HYPERLINK("https://evil.example","x")`);
    expect(body.notes).toBe("'+1 call first");
    expect(body.phone).toBe("(415) 555-0123");
  });
});

describe("asSheetText", () => {
  it.each([
    ["=1+1", "'=1+1"],
    ["+1", "'+1"],
    ["-1", "'-1"],
    ["@x", "'@x"],
    ["Jane", "Jane"],
    ["", ""],
  ])("%j becomes %j", (input, output) => {
    expect(asSheetText(input)).toBe(output);
  });
});
