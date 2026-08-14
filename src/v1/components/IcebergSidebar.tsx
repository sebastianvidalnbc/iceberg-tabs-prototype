// Mostly-decorative placeholder that mimics the real Iceberg left navigation so
// the prototype visibly lives inside Iceberg. Two items are interactive so
// reviewers can switch scenarios through the real IA: "Pages" (Page scenario)
// and "Widgets" (the /retention-service-config-us Widget scenario).

import { useHashRoute } from "../../ui/useHashRoute";

const COLUMN_A = [
  "Pages",
  "Content Pages",
  "Event Pages",
  "Widgets",
  "Central Mgmt",
  "QA Queue",
  "Optimizely",
  "Scheduled Pages",
  "Redirects",
  "Services CMS",
  "Help",
];

// The two nav items wired to a scenario route.
const ROUTE_FOR: Record<string, string> = {
  Pages: "#/",
  Widgets: "#/widgets",
};

const COLUMN_B = [
  "Variants",
  "Variants Quick View",
  "Publish",
  "Send To QA",
  "Save",
  "QA Review",
  "QA Notes",
  "Settings",
  "Edit",
  "CSS",
  "JSON-LD",
  "Dock Edit",
];

function SideItem({ label, active }: { label: string; active?: boolean }) {
  const href = ROUTE_FOR[label];
  const className = `side-item${active ? " active" : ""}${href ? " side-item--link" : ""}`;
  const content = (
    <>
      <span className="side-glyph" />
      <span className="side-label">{label}</span>
    </>
  );
  if (href) {
    return (
      <a className={className} href={href}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}

export function IcebergSidebar() {
  const route = useHashRoute();
  const onWidget = route.startsWith("#/widgets");
  // Only the interactive items reflect the active scenario; the rest stay
  // decorative. "Variants" remains the active sub-item in column B.
  const activeA = (label: string) =>
    (label === "Widgets" && onWidget) || (label === "Pages" && !onWidget);

  return (
    <aside className="iceberg-sidebar">
      <div className="side-col">
        {COLUMN_A.map((l) => (
          <SideItem key={l} label={l} active={activeA(l)} />
        ))}
      </div>
      <div className="side-col" aria-hidden="true">
        {COLUMN_B.map((l) => (
          <SideItem key={l} label={l} active={l === "Variants"} />
        ))}
      </div>
    </aside>
  );
}
