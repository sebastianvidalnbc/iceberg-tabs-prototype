import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

// Text label with an optional status tint — never color-only (always has text).
export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span className={`ui-badge${variant !== "default" ? ` ui-badge--${variant}` : ""}`}>
      {children}
    </span>
  );
}

type DotStatus = "default" | "success" | "warning" | "danger";

export interface StatusDotProps {
  status?: DotStatus;
  children: ReactNode;
}

// Dot plus an adjacent text label.
export function StatusDot({ status = "default", children }: StatusDotProps) {
  return (
    <span className={`ui-status-dot${status !== "default" ? ` ui-status-dot--${status}` : ""}`}>
      <span className="ui-status-dot__dot" aria-hidden="true" />
      {children}
    </span>
  );
}
