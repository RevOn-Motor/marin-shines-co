import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hero, site } from "@/content/site";
import Home from "./page";

describe("Home page", () => {
  it("has exactly one H1: the Marin County keyword headline", () => {
    render(<Home />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(hero.headline);
  });

  it("opens with the hero quote form and has no navigation", () => {
    const { container } = render(<Home />);
    expect(container.querySelector("#quote[data-quote-form]")).not.toBeNull();
    expect(container.querySelector("nav")).toBeNull();
  });

  it("points every quote CTA at the hero form and every phone link at one number", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll("[data-quote-form]")).toHaveLength(2);
    expect(container.querySelector("#quote[data-quote-form]")).not.toBeNull();

    const quoteLinks = Array.from(container.querySelectorAll('[data-cta="quote"]'));
    expect(quoteLinks.length).toBeGreaterThanOrEqual(6);
    for (const link of quoteLinks) expect(link).toHaveAttribute("href", "#quote");

    const phoneLinks = Array.from(container.querySelectorAll('a[href^="tel:"]'));
    expect(phoneLinks.length).toBeGreaterThanOrEqual(4);
    for (const link of phoneLinks) {
      expect(link).toHaveAttribute("href", `tel:${site.phone.tel}`);
      expect(link).toHaveAttribute("data-cta", "phone");
    }
  });

  it("links internally only to the privacy policy", () => {
    const { container } = render(<Home />);
    const internal = Array.from(container.querySelectorAll('a[href^="/"]')).map((link) => link.getAttribute("href"));
    expect(new Set(internal)).toEqual(new Set(["/privacy"]));
  });
});
