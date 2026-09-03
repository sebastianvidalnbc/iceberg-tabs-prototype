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
    <img
      alt=""
      src={src}
      style={{
        position: "absolute",
        left: x * s,
        top: y * s,
        width: w * s,
        height: h * s,
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
      }}
    >
      {layer(outer, 0, 0, 24, 24)}
      {layer(middle, 2.79, 2.79, 18.411, 18.418)}
      {layer(inner, 5.48, 5.83, 12.924, 12.343)}
    </span>
  );
}
