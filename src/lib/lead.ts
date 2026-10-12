import { SERVICE_IDS, TOWN_OPTIONS, services, type ServiceId, type Town } from "@/content/site";

export const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"] as const;
export const BATHROOMS = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"] as const;
export type Bedrooms = (typeof BEDROOMS)[number];
export type Bathrooms = (typeof BATHROOMS)[number];

export const STEP_ONE_FIELDS = ["service", "town", "bedrooms", "bathrooms"] as const;
export const STEP_TWO_FIELDS = ["name", "phone", "email", "notes"] as const;
export const LEAD_FIELDS = [...STEP_ONE_FIELDS, ...STEP_TWO_FIELDS] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];
export type FieldErrors = Partial<Record<LeadField, string>>;

/** Raw form values as typed. `honeypot` is the bot trap; `source` is the id of the form used. */
export type LeadInput = Record<LeadField | "honeypot" | "source", string>;

export type Lead = {
  service: ServiceId;
  town: Town;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  name: string;
  /** Exactly 10 digits, no formatting. */
  phone: string;
  email: string;
  notes: string;
  source: string;
};

export type ValidationResult = { ok: true; lead: Lead } | { ok: false; fieldErrors: FieldErrors };

const INPUT_KEYS = [...LEAD_FIELDS, "honeypot", "source"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_PATTERN = /^[a-z][a-z-]{0,39}$/;

function isOneOf<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

export function emptyLeadInput(source = "unknown"): LeadInput {
  const input = Object.fromEntries(INPUT_KEYS.map((key) => [key, ""])) as LeadInput;
  input.source = source;
  return input;
}

/** Returns the 10-digit US number, or null when it can't be one. */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? digits : null;
}

export function formatPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function serviceName(id: ServiceId): string {
  return services.find((service) => service.id === id)?.name ?? id;
}

const RULES: Record<LeadField, (value: string) => string | null> = {
  service: (value) => (isOneOf(SERVICE_IDS, value) ? null : "Choose a service."),
  town: (value) => (isOneOf(TOWN_OPTIONS, value) ? null : "Choose your town."),
  bedrooms: (value) => (isOneOf(BEDROOMS, value) ? null : "Choose the number of bedrooms."),
  bathrooms: (value) => (isOneOf(BATHROOMS, value) ? null : "Choose the number of bathrooms."),
  name: (value) => {
    const name = value.trim();
    if (!name) return "Enter your name.";
    return name.length > 100 ? "Keep your name under 100 characters." : null;
  },
  phone: (value) => (normalizePhone(value) ? null : "Enter a 10-digit phone number."),
  email: (value) => {
    const email = value.trim();
    return email.length <= 254 && EMAIL_PATTERN.test(email)
      ? null
      : "Enter an email like name@example.com.";
  },
  notes: (value) => (value.trim().length > 1000 ? "Keep notes under 1,000 characters." : null),
};

export function validateFields(input: LeadInput, fields: readonly LeadField[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of fields) {
    const message = RULES[field](input[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateLead(input: LeadInput): ValidationResult {
  const fieldErrors = validateFields(input, LEAD_FIELDS);
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    lead: {
      service: input.service as ServiceId,
      town: input.town as Town,
      bedrooms: input.bedrooms as Bedrooms,
      bathrooms: input.bathrooms as Bathrooms,
      name: input.name.trim(),
      phone: normalizePhone(input.phone) as string,
      email: input.email.trim(),
      notes: input.notes.trim(),
      source: SOURCE_PATTERN.test(input.source) ? input.source : "unknown",
    },
  };
}

export function parseLeadForm(formData: FormData): LeadInput {
  const input = emptyLeadInput();
  for (const key of INPUT_KEYS) {
    const value = formData.get(key);
    input[key] = typeof value === "string" ? value : "";
  }
  return input;
}

export function toFormData(input: LeadInput): FormData {
  const formData = new FormData();
  for (const key of INPUT_KEYS) formData.append(key, input[key]);
  return formData;
}
