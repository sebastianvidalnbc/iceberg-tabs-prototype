export interface LoadingIndicatorProps {
  label?: string;
  showLabel?: boolean;
}

// Spinner with a status role and a visually-hidden (or visible) label.
// Reduced-motion turns the spin off via CSS.
export function LoadingIndicator({ label = "Loading", showLabel = false }: LoadingIndicatorProps) {
  return (
    <span className="ui-loading" role="status">
      <span className="ui-spinner" aria-hidden="true" />
      <span className={showLabel ? undefined : "ui-visually-hidden"}>{label}</span>
    </span>
  );
}
