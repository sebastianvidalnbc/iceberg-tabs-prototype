// V4 · Eos iconography.
// ---------------------------------------------------------------------------
// Eos's icon set IS Material Symbols (confirmed from the Eos Library Figma:
// the "Icons" page contains 130+ Material Symbols components — search, add,
// edit, delete, archive, more_vert, chevron_*, keyboard_arrow_*, etc.). So V4
// renders icons via the Material Symbols Outlined font (loaded in v4.html)
// instead of V2's hand-rolled stroke SVGs.
//
// The `IconName` union is kept stable (same names V2 used, plus a few
// action-accurate additions) so existing call sites keep working; each name
// maps to the correct Material Symbol ligature. This is the icon-audit mapping
// (Phase 4): every glyph is a verified Material Symbol — no random substitutions.

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
  | "trash"
  | "file"
  | "doc-text"
  | "calendar"
  | "sliders"
  | "clipboard-check"
  | "clock"
  | "redirect"
  | "server"
  | "blocks"
  | "cube"
  | "flask"
  | "calendar-clock"
  | "help"
  // --- V4 action-accurate additions (better Eos/Material fidelity) ---------
  | "edit"
  | "copy"
  | "archive"
  | "eye"
  | "grid";

// IconName → Material Symbols ligature. Documented mapping (Phase 4 audit):
//   Nav destinations use the closest Material Symbol to each Iceberg concept;
//   table/row actions use the exact Material action glyph.
const LIGATURES: Record<IconName, string> = {
  // Structure / disclosure
  "chevron-right": "chevron_right",
  "chevron-down": "keyboard_arrow_down",
  grip: "drag_indicator",
  dots: "more_vert",
  // Common actions
  search: "search",
  plus: "add",
  download: "download",
  check: "check",
  warning: "warning",
  info: "info",
  ban: "block",
  trash: "delete",
  edit: "edit",
  copy: "content_copy",
  archive: "archive",
  eye: "visibility",
  grid: "grid_view",
  star: "star",
  trophy: "trophy",
  sparkles: "auto_awesome",
  // Nav destinations (label → concept → Material Symbol)
  file: "draft", // Pages — exact curated Eos glyph (icon frame 95:1772)
  "doc-text": "description", // Content Pages — Material Symbol (not in curated sample; documented gap)
  calendar: "today", // Event Pages — curated Eos glyph (calendar)
  sliders: "edit", // legacy V2 "edit" action glyph → edit (curated)
  "clipboard-check": "fact_check", // QA Queue — Material Symbol (documented gap)
  clock: "schedule", // time — curated Eos glyph
  redirect: "alt_route", // Redirects — Material Symbol (documented gap)
  server: "dns", // Services CMS — Material Symbol (documented gap)
  blocks: "widgets", // Widgets — Material Symbol (documented gap)
  cube: "hub", // Central Mgmt — Material Symbol (documented gap)
  flask: "science", // Optimizely (experiments) — Material Symbol (documented gap)
  "calendar-clock": "schedule", // Scheduled Pages — curated Eos glyph (clock)
  help: "help", // Help — Material Symbol (documented gap)
};

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`eos-icon material-symbols-outlined${className ? ` ${className}` : ""}`}
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden="true"
    >
      {LIGATURES[name]}
    </span>
  );
}
