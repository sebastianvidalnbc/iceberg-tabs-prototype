import { V2_APP_NAV, type AuthoringContext } from "../data";
import { Icon, type IconName } from "../../ui/Icon";

// Distinct icon per nav destination, keyed by the V2 nav label. Any unmapped
// item falls back to its initial letter (see lookup in the render).
const NAV_ICONS: Record<string, IconName> = {
  Page: "file",
  Widget: "grip",
  "Content Pages": "doc-text",
  "Event Pages": "calendar",
  "Central Mgmt": "sliders",
  "QA Queue": "clipboard-check",
  Optimizely: "sparkles",
  "Scheduled Pages": "clock",
  Redirects: "redirect",
  "Services CMS": "server",
  Help: "info",
};

interface AppNavProps {
  // The active authoring context; the bound nav item is shown as current.
  context: AuthoringContext;
  // Invoked when an actionable (context-bound) nav item is clicked.
  onSelectContext: (context: AuthoringContext) => void;
}

// Narrow, subordinate left rail rendered as a column of square icon tiles.
// Labels are visually hidden but exposed via aria-label + native tooltip, so
// the compact rail stays identifiable and accessible. The first two items
// (Page / Widget) are actionable and bound to an AuthoringContext; the rest
// mirror the Iceberg IA but stay inert for now.
export function AppNav({ context, onSelectContext }: AppNavProps) {
  return (
    <nav className="ui-ws__region ui-ws-nav" aria-label="Primary">
      <div className="ui-ws-nav__brand" title="Iceberg">
        <span className="ui-ws-nav__mark" aria-hidden="true" />
      </div>
      <div className="ui-ws-nav__list">
        {V2_APP_NAV.map((item) => {
          const actionable = item.context !== undefined;
          const active = actionable && item.context === context;
          const icon = NAV_ICONS[item.label];
          return (
            <button
              key={item.id}
              type="button"
              className={`ui-ws-nav__item${active ? " ui-ws-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              onClick={
                actionable ? () => onSelectContext(item.context!) : undefined
              }
            >
              {icon ? (
                <Icon name={icon} size={18} />
              ) : (
                <span className="ui-ws-nav__initial" aria-hidden="true">
                  {item.label.charAt(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
