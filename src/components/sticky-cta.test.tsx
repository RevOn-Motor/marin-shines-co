import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StickyCta } from "./sticky-cta";

class FakeObserver {
  static latest: FakeObserver | null = null;
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeObserver.latest = this;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function entry(target: Element, isIntersecting: boolean, bottom: number) {
  return { target, isIntersecting, boundingClientRect: { bottom } } as unknown as IntersectionObserverEntry;
}

function report(entries: IntersectionObserverEntry[]) {
  const observer = FakeObserver.latest!;
  act(() => observer.callback(entries, observer as unknown as IntersectionObserver));
}

function renderPage() {
  const { container } = render(
    <>
      <div data-quote-form id="quote" />
      <div data-quote-form id="final-quote" />
      <StickyCta />
    </>,
  );
  const [heroForm, finalForm] = Array.from(container.querySelectorAll("[data-quote-form]"));
  const bar = container.querySelector("[data-sticky-cta]")!;
  return { heroForm, finalForm, bar };
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeObserver.latest = null;
});

it("appears once the hero form is scrolled past and hides while a form is on screen", () => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  const { heroForm, finalForm, bar } = renderPage();
  expect(bar).toHaveAttribute("data-visible", "false");
  expect(bar).toHaveAttribute("inert");

  report([entry(heroForm, false, -50), entry(finalForm, false, 2400)]);
  expect(bar).toHaveAttribute("data-visible", "true");
  expect(bar).not.toHaveAttribute("inert");

  report([entry(finalForm, true, 600)]);
  expect(bar).toHaveAttribute("data-visible", "false");
});

it("stays hidden while the visitor is still above the hero form", () => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  const { heroForm, finalForm, bar } = renderPage();
  report([entry(heroForm, false, 900), entry(finalForm, false, 3000)]);
  expect(bar).toHaveAttribute("data-visible", "false");
});

it("renders hidden without crashing when IntersectionObserver is unavailable", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const { bar } = renderPage();
  expect(bar).toHaveAttribute("data-visible", "false");
});
