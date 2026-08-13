import { Icon } from "./Icon";
import { IconButton } from "./Button";

type Size = "sm" | "md";

export interface TextInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: Size;
  type?: string;
  "aria-describedby"?: string;
}

// Shared base .ui-control gives every input the same height/border/radius/focus.
export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  invalid,
  disabled,
  readOnly,
  size = "md",
  type = "text",
  ...rest
}: TextInputProps) {
  return (
    <input
      id={id}
      type={type}
      className={`ui-control ui-input${size === "sm" ? " ui-control--sm" : ""}`}
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

export interface SearchInputProps extends Omit<TextInputProps, "type"> {
  onClear?: () => void;
}

// Leading search glyph + input + optional clear affordance.
export function SearchInput({ onClear, value, ...rest }: SearchInputProps) {
  return (
    <div className="ui-search">
      <Icon name="search" className="ui-search__icon" />
      <TextInput value={value} type="search" {...rest} />
      {onClear && value && (
        <IconButton
          icon="ban"
          size={rest.size}
          aria-label="Clear search"
          className="ui-search__clear"
          onClick={onClear}
        />
      )}
    </div>
  );
}
