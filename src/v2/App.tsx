import { useHashRoute } from "../ui/useHashRoute";
import { WorkspaceShell } from "./WorkspaceShell";
import { AppShell } from "./AppShell";
import { PagesView } from "./views/PagesView";
import { VariantsView } from "./views/VariantsView";
import { parseRoute } from "./browse";

// V2 entry point + top-level router. The prototype now mirrors real Iceberg's
// three navigation levels, each a linkable hash route:
//   #/pages              → Pages list (browse slugs)
//   #/pages/:pageId      → Variants list for a slug
//   #/editor/:variantId  → the four-region editor workspace
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
    return <WorkspaceShell initialVariantId={route.variantId} />;
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
