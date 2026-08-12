export interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export function Radio({ name, value, checked, onChange, label, disabled }: RadioProps) {
  return (
    <label className="ui-radio">
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  legend?: string;
  disabled?: boolean;
}

// Native radios inside a fieldset get arrow-key navigation for free.
export function RadioGroup({ name, value, onChange, options, legend, disabled }: RadioGroupProps) {
  return (
    <fieldset className="ui-radio-group">
      {legend && <legend className="ui-radio-group__legend">{legend}</legend>}
      <div className="ui-radio-group__options">
        {options.map((o) => (
          <Radio
            key={o}
            name={name}
            value={o}
            label={o}
            checked={value === o}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}
