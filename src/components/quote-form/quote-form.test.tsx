import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectService } from "@/lib/quote-events";
import {
  DELIVERY_FAILED_MESSAGE,
  INVALID_MESSAGE,
  type QuoteAction,
  type QuoteState,
} from "@/lib/quote-state";
import { trackLeadConversion } from "@/lib/tracking";
import { QuoteForm } from "./quote-form";

vi.mock("@/lib/tracking", () => ({
  trackLeadConversion: vi.fn(() => true),
  trackPhoneClick: vi.fn(() => true),
}));

type User = ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  vi.mocked(trackLeadConversion).mockClear();
});

function renderForm(action: QuoteAction = vi.fn<QuoteAction>(async () => ({ status: "success" }))) {
  const user = userEvent.setup();
  render(<QuoteForm id="quote" action={action} title="Get your free quote" />);
  return { user, action };
}

async function completeStepOne(user: User) {
  await user.click(screen.getByRole("radio", { name: "Deep clean" }));
  await user.selectOptions(screen.getByLabelText("Town"), "Mill Valley");
  await user.selectOptions(screen.getByLabelText("Bedrooms"), "3");
  await user.selectOptions(screen.getByLabelText("Bathrooms"), "2");
  await user.click(screen.getByRole("button", { name: "Next: your details" }));
}

async function completeStepTwo(user: User) {
  await user.type(screen.getByLabelText("Name"), "Jane Doe");
  await user.type(screen.getByLabelText("Phone"), "415-555-0123");
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
}

async function submitValidRequest(user: User) {
  await completeStepOne(user);
  await completeStepTwo(user);
  await user.click(screen.getByRole("button", { name: "Get my free quote" }));
}

describe("QuoteForm step 1", () => {
  it("shows what's missing and stays on step 1 when Next is pressed early", async () => {
    const { user, action } = renderForm();
    await user.click(screen.getByRole("button", { name: "Next: your details" }));

    expect(screen.getByText("Choose a service.")).toBeInTheDocument();
    expect(screen.getByText("Choose your town.")).toBeInTheDocument();
    expect(screen.getByText("Choose the number of bedrooms.")).toBeInTheDocument();
    expect(screen.getByText("Choose the number of bathrooms.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).not.toBeVisible();
    expect(screen.getByRole("radio", { name: "Standard" })).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("moves to step 2 and focuses the step label once step 1 is complete", async () => {
    const { user } = renderForm();
    await completeStepOne(user);

    expect(screen.getByLabelText("Name")).toBeVisible();
    expect(screen.getByText("Step 2 of 2")).toHaveFocus();
  });

  it("keeps step 1 choices when going Back", async () => {
    const { user } = renderForm();
    await completeStepOne(user);
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("radio", { name: "Deep clean" })).toBeChecked();
    expect(screen.getByLabelText("Town")).toHaveValue("Mill Valley");
    expect(screen.getByText("Step 1 of 2")).toHaveFocus();
  });

  it("treats a submit on step 1 as Next and never sends", async () => {
    const { user, action } = renderForm();
    await user.click(screen.getByRole("radio", { name: "Deep clean" }));
    fireEvent.submit(screen.getByRole("form", { name: "Get your free quote" }));

    expect(screen.getByText("Choose your town.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("pre-selects the service announced by a quote link", () => {
    renderForm();
    act(() => selectService("move"));
    expect(screen.getByRole("radio", { name: "Move-in/out" })).toBeChecked();
  });
});

describe("QuoteForm step 2", () => {
  it("shows what's missing without sending", async () => {
    const { user, action } = renderForm();
    await completeStepOne(user);
    await user.click(screen.getByRole("button", { name: "Get my free quote" }));

    expect(screen.getByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a 10-digit phone number.")).toBeInTheDocument();
    expect(screen.getByText("Enter an email like name@example.com.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("sends every field once, disables the button while sending, then confirms", async () => {
    let finish: (state: QuoteState) => void = () => {};
    const action = vi.fn<QuoteAction>(
      () =>
        new Promise<QuoteState>((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = renderForm(action);
    await completeStepOne(user);
    await completeStepTwo(user);
    await user.dblClick(screen.getByRole("button", { name: "Get my free quote" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(Object.fromEntries(action.mock.calls[0][1])).toEqual({
      service: "deep",
      town: "Mill Valley",
      bedrooms: "3",
      bathrooms: "2",
      name: "Jane Doe",
      phone: "415-555-0123",
      email: "jane@example.com",
      notes: "",
      honeypot: "",
      source: "quote",
    });
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();

    await act(async () => finish({ status: "success" }));
    expect(await screen.findByText("Quote request sent.")).toHaveFocus();
    expect(trackLeadConversion).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("shows the phone fallback and keeps every value when delivery fails", async () => {
    const action = vi.fn<QuoteAction>(async () => ({
      status: "error",
      message: DELIVERY_FAILED_MESSAGE,
      fieldErrors: {},
    }));
    const { user } = renderForm(action);
    await submitValidRequest(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(DELIVERY_FAILED_MESSAGE);
    expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
    expect(screen.getByRole("button", { name: "Get my free quote" })).toBeEnabled();
    expect(trackLeadConversion).not.toHaveBeenCalled();
  });

  it("shows the phone fallback when the action throws", async () => {
    const action = vi.fn<QuoteAction>(async () => {
      throw new Error("Failed to find Server Action");
    });
    const { user } = renderForm(action);
    await submitValidRequest(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(DELIVERY_FAILED_MESSAGE);
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    expect(trackLeadConversion).not.toHaveBeenCalled();
  });

  it("lets the visitor retry after a failed delivery", async () => {
    const action = vi
      .fn<QuoteAction>()
      .mockResolvedValueOnce({ status: "error", message: DELIVERY_FAILED_MESSAGE, fieldErrors: {} })
      .mockResolvedValueOnce({ status: "success" });
    const { user } = renderForm(action);
    await submitValidRequest(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(DELIVERY_FAILED_MESSAGE);

    await user.click(screen.getByRole("button", { name: "Get my free quote" }));

    expect(await screen.findByText("Quote request sent.")).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(2);
  });

  it("returns to step 1 when the server rejects a step 1 field", async () => {
    const action = vi.fn<QuoteAction>(async () => ({
      status: "error",
      message: INVALID_MESSAGE,
      fieldErrors: { town: "Choose your town." },
    }));
    const { user } = renderForm(action);
    await submitValidRequest(user);

    expect(await screen.findByText("Choose your town.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Town")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(INVALID_MESSAGE);
  });
});
