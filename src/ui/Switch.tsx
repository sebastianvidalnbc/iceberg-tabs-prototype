export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

// role="switch" button; state is conveyed by thumb position (non-color) and
// aria-checked. Space/Enter toggle natively because it is a real button.
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="ui-switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="ui-switch__track">
        <span className="ui-switch__thumb" />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}
