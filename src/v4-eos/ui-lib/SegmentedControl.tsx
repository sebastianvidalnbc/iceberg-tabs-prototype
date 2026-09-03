import { useRef } from "react";

export interface SegmentedOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}

// Pick one of a small fixed set inline. radiogroup semantics + arrow keys.
export function SegmentedControl({ options, value, onChange, ...rest }: SegmentedControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (i: number) => {
    const next = (i + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") move(i - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="ui-segmented" role="radiogroup" aria-label={rest["aria-label"]}>
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="ui-segmented__option"
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
