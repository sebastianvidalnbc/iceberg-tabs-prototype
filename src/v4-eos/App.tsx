import { useHashRoute } from "./ui-lib/useHashRoute";
import { WorkspaceShell } from "./WorkspaceShell";
import { AppShell } from "./AppShell";
import { PagesView } from "./views/PagesView";
import { VariantsView } from "./views/VariantsView";
import { WidgetsView } from "./views/WidgetsView";
import { DesignSystem } from "./regions/DesignSystem";
import { parseRoute } from "./browse";

// V2 entry point + top-level router. Pages use a two-level browse-then-edit
// flow; Widgets are a single inline-expandable list (matching real Iceberg's
// Widgets screen). Each level is a linkable hash route:
//   #/pages               → Pages list (browse slugs)
//   #/pages/:pageId        → Variants list for a page slug
//   #/widgets              → Widgets list (rows expand inline; no sub-route)
//   #/editor/:variantId    → the four-region editor workspace
// The persistent left navigation rail (AppShell) is global chrome shown on every
// level. Browse levels are wrapped here; the editor renders its own AppShell so
// the rail can drive its in-place context switch. Unknown/empty hash falls back
// to the Pages list. V1 is unaffected.
export default function App() {
  const hash = useHashRoute();
  const route = parseRoute(hash);

  if (route.view === "editor") {
    // WorkspaceShell owns the rail here so clicking Pages/Widgets swaps the
    // in-editor dataset (its existing behaviour) rather than leaving the editor.
    // The route carries the authoring context so a widget deep link boots the
    // editor in widget mode (widget breadcrumb + tree), not the Pages default.
    return (
      <WorkspaceShell
        initialContext={route.context}
        initialVariantId={route.variantId}
      />
    );
  }
  if (route.view === "design-system") {
    // V2-only catalog for the shadcn layer. Wrapped in AppShell so it keeps the
    // persistent rail and dark theme; the page owns its own header + back link.
    return (
      <AppShell activeContext="page">
        <DesignSystem />
      </AppShell>
    );
  }
  if (route.view === "widgets") {
    return (
      <AppShell activeContext="widget">
        <WidgetsView />
      </AppShell>
    );
  }
  if (route.view === "variants") {
    return (
      <AppShell activeContext="page">
        <VariantsView pageId={route.pageId} />
      </AppShell>
    );
  }
  return (
    <AppShell activeContext="page">
      <PagesView />
    </AppShell>
  );
}
