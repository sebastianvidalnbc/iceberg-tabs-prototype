// The Iceberg brand mark, taken verbatim from the real Iceberg product logo
// (iceberg-commerce · apps/iceberg-services-cms/src/svg/iceberg-logo.tsx). The
// facet fills are the canonical brand blues — the same palette that seeds the
// Iceberg-blue accent role in tokens.css. Rendered in the nav rail's brand slot.
export function IcebergLogo({
  height = 26,
  className,
}: {
  height?: number;
  className?: string;
}) {
  const width = (height * 440) / 558;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 440 558"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="1.414"
      className={className}
      role="img"
      aria-label="Iceberg"
    >
      <path d="M60 239l81 157 80-157H60z" fill="#01699b" />
      <path d="M301 398l81-159H221l80 159z" fill="#01699b" />
      <path d="M330 457l110-218h-59l-80 159 29 59z" fill="#004b73" />
      <path d="M221 238l80 160-81 160-79-162 80-158z" fill="#016798" />
      <path d="M0 219L109 81l29 33-76 105H0z" fill="#a6cfde" />
      <path d="M440 219L330 81l-27 33 74 105h63z" fill="#a6cfde" />
      <path d="M138 114L220 0l83 114-82 106-83-106z" fill="#d6e9e7" />
      <path d="M221 219l82-105 81 105H221z" fill="#b1d9e7" />
      <path d="M61 219l77-105 83 105H61z" fill="#b1d9e7" />
      <path d="M0 239h61l80 157-31 61L0 239z" fill="#004b73" />
      <path d="M0 219v21l439.972-.023-.007-20.97L0 219z" fill="#01acca" />
    </svg>
  );
}
