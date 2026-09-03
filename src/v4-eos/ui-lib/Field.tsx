import { useMemo } from "react";
import type { ReactNode } from "react";

export function RequiredIndicator() {
  return (
    <>
      <span className="ui-field__req" aria-hidden="true">
        *
      </span>
      <span className="ui-visually-hidden"> required</span>
    </>
  );
}

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="ui-field__label" htmlFor={htmlFor}>
      {children}
      {required && <RequiredIndicator />}
    </label>
  );
}

export function HelperText({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="ui-field__help">
      {children}
    </p>
  );
}

export function ValidationMessage({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="ui-field__error" role="alert">
      {children}
    </p>
  );
}

// Alias for feedback usage — inline validation shares the error styling.
export const InlineValidation = ValidationMessage;

interface FieldRenderArgs {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export interface FieldProps {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: (args: FieldRenderArgs) => ReactNode;
}

let uid = 0;

// Composes label + control + helper + error and wires htmlFor,
// aria-describedby and aria-invalid via a render-prop child.
export function Field({ label, required, helper, error, children }: FieldProps) {
  const id = useMemo(() => `f${++uid}`, []);
  const helpId = helper ? `${id}-help` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="ui-field">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      {children({ id, describedBy, invalid: !!error })}
      {helper && <HelperText id={helpId}>{helper}</HelperText>}
      {error && <ValidationMessage id={errId}>{error}</ValidationMessage>}
    </div>
  );
}

// Groups several related fields under a shared heading.
export function FieldGroup({ legend, children }: { legend?: string; children: ReactNode }) {
  return (
    <fieldset className="ui-radio-group">
      {legend && <legend className="ui-radio-group__legend">{legend}</legend>}
      <div className="ui-ds__stack">{children}</div>
    </fieldset>
  );
}
