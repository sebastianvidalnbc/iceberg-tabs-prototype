export type SelectOption = { label: string; value: string } | string;

export interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  invalid?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  "aria-describedby"?: string;
}

const normalize = (o: SelectOption) =>
  typeof o === "string" ? { label: o, value: o } : o;

export function Select({
  id,
  value,
  onChange,
  options,
  invalid,
  disabled,
  size = "md",
  ...rest
}: SelectProps) {
  return (
    <select
      id={id}
      className={`ui-control ui-select${size === "sm" ? " ui-control--sm" : ""}`}
      value={value}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {options.map((raw) => {
        const o = normalize(raw);
        return (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        );
      })}
    </select>
  );
}
