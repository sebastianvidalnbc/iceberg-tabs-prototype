export interface DateInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  "aria-describedby"?: string;
}

// Native date control on the shared .ui-control base.
export function DateInput({
  id,
  value,
  onChange,
  invalid,
  disabled,
  size = "md",
  ...rest
}: DateInputProps) {
  return (
    <input
      id={id}
      type="date"
      className={`ui-control ui-input${size === "sm" ? " ui-control--sm" : ""}`}
      value={value}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
