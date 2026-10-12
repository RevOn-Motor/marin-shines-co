import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { QUOTE_SELECT_EVENT } from "@/lib/quote-events";
import { QuoteLink } from "./quote-link";

const listener = vi.fn();
afterEach(() => {
  window.removeEventListener(QUOTE_SELECT_EVENT, listener);
  listener.mockReset();
});

it("selects the service and brings the nearest quote form into view", async () => {
  render(
    <>
      <form data-quote-form id="quote">
        <p data-quote-focus tabIndex={-1}>
          Hero step
        </p>
      </form>
      <form data-quote-form id="final-quote">
        <p data-quote-focus tabIndex={-1}>
          Final step
        </p>
      </form>
      <QuoteLink service="deep">Get a quote</QuoteLink>
    </>,
  );
  const [heroForm, finalForm] = Array.from(document.querySelectorAll<HTMLElement>("[data-quote-form]"));
  heroForm.getBoundingClientRect = () => ({ top: -900 }) as DOMRect;
  finalForm.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
  heroForm.scrollIntoView = vi.fn();
  finalForm.scrollIntoView = vi.fn();
  window.addEventListener(QUOTE_SELECT_EVENT, listener);

  const link = screen.getByRole("link", { name: "Get a quote" });
  expect(link).toHaveAttribute("href", "#quote");
  expect(link).toHaveAttribute("data-cta", "quote");
  await userEvent.click(link);

  expect(finalForm.scrollIntoView).toHaveBeenCalledTimes(1);
  expect(heroForm.scrollIntoView).not.toHaveBeenCalled();
  expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ service: "deep" });
  expect(screen.getByText("Final step")).toHaveFocus();
});

it("falls back to the #quote anchor when no form is on the page", () => {
  render(<QuoteLink>Get my free quote</QuoteLink>);
  const notPrevented = fireEvent.click(screen.getByRole("link", { name: "Get my free quote" }));
  expect(notPrevented).toBe(true);
});
