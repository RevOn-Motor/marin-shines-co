import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hero } from "@/content/site";
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
});
