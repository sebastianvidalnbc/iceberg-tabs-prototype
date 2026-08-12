import type { ButtonHTMLAttributes } from "react";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  iconOnly?: boolean;
  block?: boolean;
}

// The single action primitive. Real <button>, focus-visible ring, loading state
// that preserves label width (color goes transparent, spinner overlays).
export function Button({
  variant = "secondary",
  size = "md",
  leadingIcon,
  trailingIcon,
  loading = false,
  iconOnly = false,
  block = false,
  className,
  type = "button",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    "ui-btn",
    `ui-btn--${variant}`,
    size === "sm" ? "ui-btn--sm" : "",
    block ? "ui-btn--block" : "",
    iconOnly ? "ui-btn--icon-only" : "",
    loading ? "is-loading" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {leadingIcon && <Icon name={leadingIcon} className="ui-btn__icon" />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} className="ui-btn__icon" />}
      {loading && <span className="ui-btn__spinner ui-spinner" aria-hidden="true" />}
    </button>
  );
}

export interface IconButtonProps
  extends Omit<ButtonProps, "iconOnly" | "children" | "leadingIcon" | "trailingIcon"> {
  icon: IconName;
  "aria-label": string;
}

// Icon-only affordance; label is mandatory for a11y.
export function IconButton({ icon, className, ...rest }: IconButtonProps) {
  return (
    <Button
      iconOnly
      variant={rest.variant ?? "tertiary"}
      className={["ui-icon-btn", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      <Icon name={icon} className="ui-btn__icon" />
    </Button>
  );
}
