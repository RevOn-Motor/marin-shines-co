import { fieldControl } from "@/components/ui";

type BaseProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function errorProps(id: string, error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

const labelClass = "text-sm font-bold text-canopy";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-bold text-alert">
      {message}
    </p>
  );
}

export function SelectField({
  id,
  name,
  label,
  value,
  options,
  error,
  onChange,
}: BaseProps & { options: readonly string[] }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldControl}
        {...errorProps(id, error)}
      >
        <option value="">Choose</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  error,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
}: BaseProps & {
  type?: "text" | "tel" | "email";
  inputMode?: "text" | "tel" | "email";
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldControl}
        {...errorProps(id, error)}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function TextAreaField({ id, name, label, value, error, onChange }: BaseProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={3}
        maxLength={1000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldControl} py-2`}
        {...errorProps(id, error)}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
