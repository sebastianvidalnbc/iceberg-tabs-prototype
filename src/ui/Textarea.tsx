export interface TextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-describedby"?: string;
}

export function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  invalid,
  disabled,
  readOnly,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      id={id}
      className="ui-control ui-textarea"
      rows={rows}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
