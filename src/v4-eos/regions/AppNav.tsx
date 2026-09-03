import { V2_APP_NAV, type AuthoringContext } from "../data";
import { Icon, type IconName } from "../ui-lib/Icon";
import { IcebergLogo } from "../ui-lib/IcebergLogo";

// Distinct icon per nav destination, keyed by the V2 nav label. Any unmapped
// item falls back to its initial letter (see lookup in the render).
const NAV_ICONS: Record<string, IconName> = {
  Pages: "file",
  Widgets: "blocks",
  "Content Pages": "doc-text",
  "Event Pages": "calendar",
  "Central Mgmt": "cube",
  "QA Queue": "clipboard-check",
  Optimizely: "flask",
  "Scheduled Pages": "calendar-clock",
  Redirects: "redirect",
  "Services CMS": "server",
  Help: "help",
};

interface AppNavProps {
  // The active authoring context; the bound nav item is shown as current.
  context: AuthoringContext;
  // Invoked when an actionable (context-bound) nav item is clicked. The shell
  // decides what this means: in the editor it swaps the in-editor dataset; in
  // the browse levels it navigates to that context's list via a hash route.
  onSelectContext: (context: AuthoringContext) => void;
}

// Narrow, subordinate left rail rendered as a scrolling column of icon+label
// tiles. Each item stacks a semantic icon above a compact, centered label so
// the rail stays identifiable while remaining narrow. The first two items
// (Pages / Widgets) are actionable and bound to an AuthoringContext; the rest
// mirror the Iceberg IA but stay inert for now. Inactive items keep the standard
// nav appearance (they are not disabled — just non-navigating).
//
// The rail is persistent global chrome: it is rendered by AppShell across every
// V2 level (Pages list, Variants list, editor), not only inside the editor.
export function AppNav({ context, onSelectContext }: AppNavProps) {
  return (
    <nav className="ui-ws__region ui-ws-nav" aria-label="Primary">
      <div className="ui-ws-nav__brand" aria-label="Iceberg">
        <IcebergLogo height={26} />
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
              onClick={
                actionable ? () => onSelectContext(item.context!) : undefined
              }
            >
              <span className="ui-ws-nav__icon" aria-hidden="true">
                {icon ? (
                  <Icon name={icon} size={24} />
                ) : (
                  <span className="ui-ws-nav__initial">
                    {item.label.charAt(0)}
                  </span>
                )}
              </span>
              <span className="ui-ws-nav__label" aria-hidden="true">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
