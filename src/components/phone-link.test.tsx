import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { trackPhoneClick } from "@/lib/tracking";
import { PhoneLink } from "./phone-link";

vi.mock("@/lib/tracking", () => ({
  trackLeadConversion: vi.fn(() => true),
  trackPhoneClick: vi.fn(() => true),
}));

it("dials the business number and records a call conversion", async () => {
  render(<PhoneLink />);
  const link = screen.getByRole("link", { name: site.phone.display });
  expect(link).toHaveAttribute("href", `tel:${site.phone.tel}`);
  expect(link).toHaveAttribute("data-cta", "phone");

  link.addEventListener("click", (event) => event.preventDefault()); // jsdom can't dial
  await userEvent.click(link);
  expect(trackPhoneClick).toHaveBeenCalledTimes(1);
});
