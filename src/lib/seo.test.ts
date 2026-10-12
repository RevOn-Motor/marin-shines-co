import { afterEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { siteUrl } from "./seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://marinshine.example/");
    expect(siteUrl()).toBe("https://marinshine.example");
  });

  it("falls back to the configured domain", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl()).toBe(site.url);
  });
});
