import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

type Variant = "info" | "success" | "warning" | "danger";

const ICON: Record<Variant, IconName> = {
  info: "info",
  success: "check",
  warning: "warning",
  danger: "ban",
};

const ICON_LABEL: Record<Variant, string> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

export interface CalloutProps {
  variant?: Variant;
  children: ReactNode;
}

// Warning/danger get role="alert"; info/success get role="status".
export function Callout({ variant = "info", children }: CalloutProps) {
  const assertive = variant === "warning" || variant === "danger";
  return (
    <div className={`ui-callout ui-callout--${variant}`} role={assertive ? "alert" : "status"}>
      <span className="ui-callout__icon">
        <Icon name={ICON[variant]} />
        <span className="ui-visually-hidden">{ICON_LABEL[variant]}: </span>
      </span>
      <div>{children}</div>
    </div>
  );
}
