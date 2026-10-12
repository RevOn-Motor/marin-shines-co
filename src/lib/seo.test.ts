import { afterEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { PAGE_DESCRIPTION, PAGE_TITLE, pageMetadata, siteUrl } from "./seo";

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

describe("pageMetadata", () => {
  it("keeps the title within 50–60 characters with the keyword and brand", () => {
    expect(PAGE_TITLE.length).toBeGreaterThanOrEqual(50);
    expect(PAGE_TITLE.length).toBeLessThanOrEqual(60);
    expect(PAGE_TITLE).toContain("Marin County");
    expect(PAGE_TITLE).toContain(site.name);
    expect(pageMetadata.title).toBe(PAGE_TITLE);
  });

  it("keeps the description within 150–160 characters and names towns", () => {
    expect(PAGE_DESCRIPTION.length).toBeGreaterThanOrEqual(150);
    expect(PAGE_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(PAGE_DESCRIPTION).toContain("Marin County");
    expect(PAGE_DESCRIPTION).toContain("Mill Valley");
    expect(PAGE_DESCRIPTION).toContain("San Rafael");
    expect(pageMetadata.description).toBe(PAGE_DESCRIPTION);
  });

  it("sets the canonical URL and social cards", () => {
    expect(pageMetadata.alternates?.canonical).toBe("/");
    expect(pageMetadata.openGraph).toMatchObject({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: "/", siteName: site.name });
    expect(pageMetadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
