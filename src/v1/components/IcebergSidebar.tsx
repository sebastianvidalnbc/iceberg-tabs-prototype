// Non-interactive placeholder that mimics the real Iceberg left navigation so
// the prototype visibly lives inside Iceberg. This bar is purely representational
// — the prototype's actual focus is the middle editor column.

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
  return (
    <div className={`side-item${active ? " active" : ""}`}>
      <span className="side-glyph" />
      <span className="side-label">{label}</span>
    </div>
  );
}

export function IcebergSidebar() {
  return (
    <aside className="iceberg-sidebar" aria-hidden="true">
      <div className="side-col">
        {COLUMN_A.map((l) => (
          <SideItem key={l} label={l} />
        ))}
      </div>
      <div className="side-col">
        {COLUMN_B.map((l) => (
          <SideItem key={l} label={l} active={l === "Variants"} />
        ))}
      </div>
    </aside>
  );
}
