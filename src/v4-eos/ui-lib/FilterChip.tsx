import { Icon } from "./Icon";

// Eos "Input chip" (Figma 488:8901, node 453:29045 "Tables/sub-components/
// Filters"): a bordered, rounded-8 toggle chip used in the browse tables'
// Filters row. Pressing an active chip again clears it back to "All".
export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`ui-filter-chip${active ? " is-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {active && <Icon name="check" size={16} />}
      {label}
    </button>
  );
}
