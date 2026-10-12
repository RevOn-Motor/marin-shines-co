"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { flushSync } from "react-dom";
import { focusRing, formCard, primaryButton } from "@/components/ui";
import { TOWN_OPTIONS, hero, services, site } from "@/content/site";
import {
  BATHROOMS,
  BEDROOMS,
  LEAD_FIELDS,
  STEP_ONE_FIELDS,
  emptyLeadInput,
  toFormData,
  validateFields,
  type FieldErrors,
  type LeadField,
  type LeadInput,
} from "@/lib/lead";
import { QUOTE_SELECT_EVENT, type QuoteSelectDetail } from "@/lib/quote-events";
import {
  DELIVERY_FAILED_MESSAGE,
  initialQuoteState,
  type QuoteAction,
  type QuoteState,
} from "@/lib/quote-state";
import { trackLeadConversion } from "@/lib/tracking";
import { FieldError, SelectField, TextAreaField, TextField } from "./fields";

type QuoteFormProps = {
  /** Anchor id. The hero form must be "quote": every quote link points at #quote. */
  id: string;
  action: QuoteAction;
  title: string;
};

function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

function withoutError(errors: FieldErrors, field: LeadField): FieldErrors {
  if (!(field in errors)) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

/** A thrown action (offline, stale deploy) must still leave the visitor a way to reach us. */
async function callAction(action: QuoteAction, previous: QuoteState, formData: FormData): Promise<QuoteState> {
  try {
    return await action(previous, formData);
  } catch {
    return { status: "error", message: DELIVERY_FAILED_MESSAGE, fieldErrors: {} };
  }
}

export function QuoteForm({ id, action, title }: QuoteFormProps) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<LeadInput>(() => emptyLeadInput(id));
  const [errors, setErrors] = useState<FieldErrors>({});
  const stepLabel = useRef<HTMLParagraphElement>(null);
  const successMessage = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);

  const submit = useMemo(
    () =>
      async (previous: QuoteState, formData: FormData): Promise<QuoteState> => {
        const next = await callAction(action, previous, formData);
        if (next.status === "success") trackLeadConversion();
        if (next.status === "error") {
          const serverErrors = next.fieldErrors;
          setErrors(serverErrors);
          if (STEP_ONE_FIELDS.some((field) => serverErrors[field])) setStep(1);
        }
        return next;
      },
    [action],
  );
  const [state, dispatch, pending] = useActionState(submit, initialQuoteState);

  useEffect(() => {
    if (state.status === "success") successMessage.current?.focus();
  }, [state]);

  useEffect(() => {
    if (!pending) inFlight.current = false;
  }, [pending]);

  useEffect(() => {
    function handleSelect(event: Event) {
      const { service } = (event as CustomEvent<QuoteSelectDetail>).detail;
      setValues((current) => ({ ...current, service }));
      setErrors((current) => withoutError(current, "service"));
    }
    window.addEventListener(QUOTE_SELECT_EVENT, handleSelect);
    return () => window.removeEventListener(QUOTE_SELECT_EVENT, handleSelect);
  }, []);

  function update(field: LeadField | "company", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== "company") setErrors((current) => withoutError(current, field));
  }

  function focusFirstInvalid(found: FieldErrors) {
    const first = LEAD_FIELDS.find((field) => found[field]);
    if (!first) return;
    const target = first === "service" ? fieldId(`service-${services[0].id}`) : fieldId(first);
    document.getElementById(target)?.focus();
  }

  function showStep(next: 1 | 2) {
    flushSync(() => setStep(next));
    stepLabel.current?.focus();
  }

  function goToStepTwo() {
    const found = validateFields(values, STEP_ONE_FIELDS);
    setErrors(found);
    if (hasErrors(found)) {
      focusFirstInvalid(found);
      return;
    }
    showStep(2);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter on step 1 submits through the hidden step 2 button; treat it as Next.
    if (step === 1) {
      goToStepTwo();
      return;
    }
    if (inFlight.current || pending) return;

    const found = validateFields(values, LEAD_FIELDS);
    if (hasErrors(found)) {
      if (STEP_ONE_FIELDS.some((field) => found[field])) flushSync(() => setStep(1));
      setErrors(found);
      focusFirstInvalid(found);
      return;
    }
    setErrors({});
    inFlight.current = true;
    startTransition(() => dispatch(toFormData(values)));
  }

  if (state.status === "success") {
    return (
      <div id={id} data-quote-form className={formCard}>
        <p
          ref={successMessage}
          tabIndex={-1}
          role="status"
          data-quote-focus
          className="font-display text-2xl font-bold text-canopy outline-none"
        >
          Quote request sent.
        </p>
        <p className="mt-2">We&apos;ll reach out within {site.responseTime} with your price.</p>
      </div>
    );
  }

  const describedBy = (field: LeadField) => (errors[field] ? `${fieldId(field)}-error` : undefined);

  return (
    <form
      id={id}
      data-quote-form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={fieldId("title")}
      className={formCard}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={fieldId("title")} className="font-display text-xl font-bold text-canopy md:text-2xl">
          {title}
        </h2>
        <p
          ref={stepLabel}
          tabIndex={-1}
          data-quote-focus
          className="shrink-0 text-sm font-bold text-ink outline-none"
        >
          Step {step} of 2
        </p>
      </div>

      <div hidden={step !== 1} className="mt-4 space-y-4 motion-safe:animate-step-in">
        <fieldset aria-describedby={describedBy("service")}>
          <legend className="text-sm font-bold text-canopy">What do you need?</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex min-h-12 cursor-pointer items-center rounded-xl border-2 border-canopy/20 px-3 font-bold text-canopy has-checked:border-canopy has-checked:bg-fog has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-canopy"
              >
                <input
                  id={fieldId(`service-${service.id}`)}
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={values.service === service.id}
                  onChange={() => update("service", service.id)}
                  className="sr-only"
                />
                {service.formLabel}
              </label>
            ))}
          </div>
          <FieldError id={`${fieldId("service")}-error`} message={errors.service} />
        </fieldset>

        <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-2">
          <SelectField
            id={fieldId("town")}
            name="town"
            label="Town"
            value={values.town}
            options={TOWN_OPTIONS}
            error={errors.town}
            onChange={(value) => update("town", value)}
          />
          <SelectField
            id={fieldId("bedrooms")}
            name="bedrooms"
            label="Bedrooms"
            value={values.bedrooms}
            options={BEDROOMS}
            error={errors.bedrooms}
            onChange={(value) => update("bedrooms", value)}
          />
          <SelectField
            id={fieldId("bathrooms")}
            name="bathrooms"
            label="Bathrooms"
            value={values.bathrooms}
            options={BATHROOMS}
            error={errors.bathrooms}
            onChange={(value) => update("bathrooms", value)}
          />
        </div>

        <button type="button" onClick={goToStepTwo} className={`${primaryButton} w-full`}>
          Next: your details
        </button>
        <p className="text-center text-sm">{hero.reassurance}</p>
      </div>

      <div hidden={step !== 2} className="mt-4 space-y-4 motion-safe:animate-step-in">
        <TextField
          id={fieldId("name")}
          name="name"
          label="Name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(value) => update("name", value)}
        />
        <TextField
          id={fieldId("phone")}
          name="phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(value) => update("phone", value)}
        />
        <TextField
          id={fieldId("email")}
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(value) => update("email", value)}
        />
        <TextAreaField
          id={fieldId("notes")}
          name="notes"
          label="Anything we should know? (optional)"
          value={values.notes}
          error={errors.notes}
          onChange={(value) => update("notes", value)}
        />
        <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
          {pending ? "Sending…" : "Get my free quote"}
        </button>
        <p className="text-sm">
          We&apos;ll never share your info.{" "}
          <Link href="/privacy" className={`font-bold underline ${focusRing}`}>
            Privacy policy
          </Link>
        </p>
        <button
          type="button"
          onClick={() => showStep(1)}
          className={`min-h-12 text-sm font-bold text-canopy underline ${focusRing}`}
        >
          Back
        </button>
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={fieldId("company")}>Company</label>
        <input
          id={fieldId("company")}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) => update("company", event.target.value)}
        />
      </div>

      {state.status === "error" ? (
        <p role="alert" className="mt-4 font-bold text-alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
