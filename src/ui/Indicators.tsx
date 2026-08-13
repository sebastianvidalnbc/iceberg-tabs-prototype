import { Icon } from "./Icon";

export interface ItemCountBadgeProps {
  count: number;
  label?: string;
}

// Numeric count with an accessible "N items" name.
export function ItemCountBadge({ count, label = "items" }: ItemCountBadgeProps) {
  return (
    <span className="ui-count" aria-label={`${count} ${label}`}>
      {count}
    </span>
  );
}

type Status = "default" | "success" | "warning" | "danger";

export interface StatusIndicatorProps {
  status?: Status;
  label: string;
}

// Dot PLUS text label — never color-only.
export function StatusIndicator({ status = "default", label }: StatusIndicatorProps) {
  return (
    <span className={`ui-status${status !== "default" ? ` ui-status--${status}` : ""}`}>
      <span className="ui-status__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export interface ValidationIndicatorProps {
  label: string;
}

// Warning glyph + accessible text + title.
export function ValidationIndicator({ label }: ValidationIndicatorProps) {
  return (
    <span className="ui-validation" title={label}>
      <Icon name="warning" />
      <span className="ui-visually-hidden">{label}</span>
    </span>
  );
}
