import outer from "./assets/opshub-logo-outer.svg";
import middle from "./assets/opshub-logo-middle.svg";
import inner from "./assets/opshub-logo-inner.svg";

// The OpsHub platform brand mark — a concentric dotted globe. Rendered from the
// three exported Eos vector layers (Figma "GS" group, node 449:15629) composed
// at their exact canvas offsets so the mark is pixel-faithful at any size. Used
// in the global top bar's brand lockup and the environment pill chip.
export function OpsHubLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const s = size / 24;
  const layer = (src: string, x: number, y: number, w: number, h: number) => (
    <span
      style={{
        position: "absolute",
        left: x * s,
        top: y * s,
        width: w * s,
        height: h * s,
        background: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    />
  );
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        flex: "none",
        color: "inherit",
      }}
    >
      {layer(outer, 0, 0, 24, 24)}
      {layer(middle, 2.79, 2.79, 18.411, 18.418)}
      {layer(inner, 5.48, 5.83, 12.924, 12.343)}
    </span>
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
