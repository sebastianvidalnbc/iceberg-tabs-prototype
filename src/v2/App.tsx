import { useHashRoute } from "../ui/useHashRoute";
import { WorkspaceShell } from "./WorkspaceShell";
import { PagesView } from "./views/PagesView";
import { VariantsView } from "./views/VariantsView";
import { parseRoute } from "./browse";

// V2 entry point + top-level router. The prototype now mirrors real Iceberg's
// three navigation levels, each a linkable hash route:
//   #/pages              → Pages list (browse slugs)
//   #/pages/:pageId      → Variants list for a slug
//   #/editor/:variantId  → the persistent four-region editor workspace
// Unknown/empty hash falls back to the Pages list. V1 is unaffected.
export default function App() {
  const hash = useHashRoute();
  const route = parseRoute(hash);

  if (route.view === "editor") {
    return <WorkspaceShell initialVariantId={route.variantId} />;
  }
  if (route.view === "variants") {
    return <VariantsView pageId={route.pageId} />;
  }
  return <PagesView />;
}
