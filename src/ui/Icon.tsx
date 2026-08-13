// Minimal inline SVG icon set (stroke-based, 16px) so the prototype has no
// external icon dependency. Names map to the small glyphs used across the UI.

export type IconName =
  | "chevron-right"
  | "chevron-down"
  | "grip"
  | "dots"
  | "search"
  | "plus"
  | "trophy"
  | "star"
  | "download"
  | "sparkles"
  | "check"
  | "warning"
  | "info"
  | "ban"
  | "trash";

const paths: Record<IconName, string> = {
  "chevron-right": "M6 4l4 4-4 4",
  "chevron-down": "M4 6l4 4 4-4",
  grip: "M6 4h.01M10 4h.01M6 8h.01M10 8h.01M6 12h.01M10 12h.01",
  dots: "M8 4h.01M8 8h.01M8 12h.01",
  search: "M7 12a5 5 0 100-10 5 5 0 000 10zM14 14l-3.5-3.5",
  plus: "M8 3v10M3 8h10",
  trophy: "M5 3h6v3a3 3 0 01-6 0V3zM5 4H3v1a2 2 0 002 2M11 4h2v1a2 2 0 01-2 2M7 9v3M6 13h4",
  star: "M8 2l1.8 3.7 4.2.6-3 3 .7 4.1L8 12.5 4.3 13.4l.7-4.1-3-3 4.2-.6z",
  download: "M8 3v7M5 7l3 3 3-3M3 13h10",
  sparkles: "M8 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM12.5 9.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L11 11.5l1.5-.5z",
  check: "M3 8.5L6.5 12 13 4",
  warning: "M8 3l6 10H2L8 3zM8 7v3M8 11.5h.01",
  info: "M8 2a6 6 0 100 12A6 6 0 008 2zM8 7v4M8 5h.01",
  ban: "M8 2a6 6 0 100 12A6 6 0 008 2zM3.8 3.8l8.4 8.4",
  trash: "M3 5h10M6.5 5V3.5h3V5M4.5 5l.7 8.5h5.6L11.5 5",
};

export function Icon({
  name,
  size = 16,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
