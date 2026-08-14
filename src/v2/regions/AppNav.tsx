import { APP_NAV } from "../data";
import { Icon, type IconName } from "../../ui/Icon";

// Distinct icon per nav destination. Any unmapped item falls back to its
// initial letter (see NAV_ICONS lookup in the render).
const NAV_ICONS: Record<string, IconName> = {
  Pages: "file",
  "Content Pages": "doc-text",
  "Event Pages": "calendar",
  Widgets: "grip",
  "Central Mgmt": "sliders",
  "QA Queue": "clipboard-check",
  Optimizely: "sparkles",
  "Scheduled Pages": "clock",
  Redirects: "redirect",
  "Services CMS": "server",
  Help: "info",
};

// Narrow, subordinate left rail rendered as a column of square icon tiles.
// Labels are visually hidden but exposed via aria-label + native tooltip, so
// the compact rail stays identifiable and accessible. Static first pass
// (Pages is the active destination).
export function AppNav() {
  return (
    <nav className="ui-ws__region ui-ws-nav" aria-label="Primary">
      <div className="ui-ws-nav__brand" title="Iceberg">
        <span className="ui-ws-nav__mark" aria-hidden="true" />
      </div>
      <div className="ui-ws-nav__list">
        {APP_NAV.map((label) => {
          const active = label === "Pages";
          const icon = NAV_ICONS[label];
          return (
            <button
              key={label}
              type="button"
              className={`ui-ws-nav__item${active ? " ui-ws-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
            >
              {icon ? (
                <Icon name={icon} size={18} />
              ) : (
                <span className="ui-ws-nav__initial" aria-hidden="true">
                  {label.charAt(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
