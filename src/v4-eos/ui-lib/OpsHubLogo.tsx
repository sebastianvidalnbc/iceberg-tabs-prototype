import mark from "./assets/opshub-logo.svg?raw";

// OpsHub platform mark — three concentric dotted rings. Inlined as a real
// SVG (fill = currentColor) so it inherits the bar / env-pill color. The
// previous CSS-mask + background:currentColor layers painted a solid square
// when the inner-ring mask failed to apply.
export function OpsHubLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flex: "none",
        color: "inherit",
        lineHeight: 0,
      }}
      dangerouslySetInnerHTML={{ __html: mark }}
    />
  );
}

/** INT-NFT environment mark from the Opshub bar env pill (Figma 449:15692). */
export function OpsHubEnvMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={className}>
      <OpsHubLogo size={22.543} className="ui-topbar__env-globe" />
      <span className="ui-topbar__env-wordmark">INT-NFT</span>
    </span>
  );
}
