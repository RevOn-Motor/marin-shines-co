import { afterEach, describe, expect, it, vi } from "vitest";
import { trackLeadConversion, trackPhoneClick } from "./tracking";

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.gtag;
});

describe("conversion tracking", () => {
  it("does nothing when no conversion ID is configured", () => {
    window.gtag = vi.fn();
    expect(trackLeadConversion()).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("does nothing when the ID is set but the Google tag never loaded", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO", "AW-1/lead");
    expect(trackLeadConversion()).toBe(false);
  });

  it("sends the lead conversion", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO", "AW-1/lead");
    const gtag = vi.fn();
    window.gtag = gtag;
    expect(trackLeadConversion()).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: "AW-1/lead" });
  });

  it("returns false instead of throwing when the Google tag throws", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO", "AW-1/lead");
    window.gtag = vi.fn(() => {
      throw new Error("blocked");
    });
    expect(trackLeadConversion()).toBe(false);
  });

  it("sends the phone-call conversion", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO", "AW-1/call");
    const gtag = vi.fn();
    window.gtag = gtag;
    expect(trackPhoneClick()).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: "AW-1/call" });
  });
});
