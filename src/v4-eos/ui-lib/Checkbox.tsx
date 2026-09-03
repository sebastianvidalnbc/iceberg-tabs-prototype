import { useEffect, useRef } from "react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
  indeterminate = false,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  // Indeterminate is only settable via the DOM property, not an attribute.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="ui-checkbox">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
