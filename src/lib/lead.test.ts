import { describe, expect, it } from "vitest";
import { SERVICE_IDS, services } from "@/content/site";
import {
  STEP_ONE_FIELDS,
  emptyLeadInput,
  formatPhone,
  normalizePhone,
  parseLeadForm,
  serviceName,
  toFormData,
  validateFields,
  validateLead,
  type LeadInput,
} from "./lead";

const valid: LeadInput = {
  ...emptyLeadInput("quote"),
  service: "deep",
  town: "Mill Valley",
  bedrooms: "3",
  bathrooms: "2",
  name: "  Jane Doe ",
  phone: "(415) 555-0123",
  email: " jane@example.com ",
  notes: " Two cats. ",
};

describe("content", () => {
  it("defines one service entry per service id, in order", () => {
    expect(services.map((service) => service.id)).toEqual([...SERVICE_IDS]);
  });
});

describe("normalizePhone", () => {
  it.each([
    ["(415) 555-0123", "4155550123"],
    ["415.555.0123", "4155550123"],
    ["+1 415 555 0123", "4155550123"],
    ["14155550123", "4155550123"],
  ])("accepts %s", (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it.each(["", "555-0123", "415555012", "1234567890", "4150550123", "41555501239"])(
    "rejects %j",
    (raw) => {
      expect(normalizePhone(raw)).toBeNull();
    },
  );
});

describe("formatPhone and serviceName", () => {
  it("formats 10 digits for people", () => {
    expect(formatPhone("4155550123")).toBe("(415) 555-0123");
  });

  it("names a service by its display name", () => {
    expect(serviceName("move")).toBe("Move-in / move-out cleaning");
  });
});

describe("validateLead", () => {
  it("returns a trimmed, normalized lead when everything is valid", () => {
    expect(validateLead(valid)).toEqual({
      ok: true,
      lead: {
        service: "deep",
        town: "Mill Valley",
        bedrooms: "3",
        bathrooms: "2",
        name: "Jane Doe",
        phone: "4155550123",
        email: "jane@example.com",
        notes: "Two cats.",
        source: "quote",
      },
    });
  });

  it("accepts the catch-all town and empty notes", () => {
    const result = validateLead({ ...valid, town: "Other Marin town", notes: "" });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["service", "", "Choose a service."],
    ["service", "carpet", "Choose a service."],
    ["town", "Oakland", "Choose your town."],
    ["bedrooms", "", "Choose the number of bedrooms."],
    ["bathrooms", "9", "Choose the number of bathrooms."],
    ["name", "   ", "Enter your name."],
    ["name", "x".repeat(101), "Keep your name under 100 characters."],
    ["phone", "555-0123", "Enter a 10-digit phone number."],
    ["email", "jane@", "Enter an email like name@example.com."],
    ["notes", "x".repeat(1001), "Keep notes under 1,000 characters."],
  ] as const)("rejects %s=%j", (field, value, message) => {
    expect(validateLead({ ...valid, [field]: value })).toEqual({
      ok: false,
      fieldErrors: { [field]: message },
    });
  });

  it("replaces an unexpected form id with 'unknown'", () => {
    const result = validateLead({ ...valid, source: "<script>" });
    expect(result.ok && result.lead.source).toBe("unknown");
  });
});

describe("validateFields", () => {
  it("checks only the fields it is given", () => {
    const stepOneDone = { ...emptyLeadInput(), service: "standard", town: "Ross", bedrooms: "Studio", bathrooms: "1" };
    expect(validateFields(stepOneDone, STEP_ONE_FIELDS)).toEqual({});
  });
});

describe("parseLeadForm and toFormData", () => {
  it("round-trips every input key", () => {
    expect(parseLeadForm(toFormData(valid))).toEqual(valid);
  });

  it("reads missing keys and file values as empty strings", () => {
    const formData = new FormData();
    formData.append("name", new Blob(["x"]));
    const parsed = parseLeadForm(formData);
    expect(parsed.name).toBe("");
    expect(parsed.service).toBe("");
    expect(parsed.source).toBe("");
  });
});
