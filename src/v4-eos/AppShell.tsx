import type { ReactNode } from "react";
import { AppNav } from "./regions/AppNav";
import { TopBar } from "./regions/TopBar";
import { routes, navigate } from "./browse";
import type { AuthoringContext } from "./data";

// Persistent global chrome for V2. The left navigation rail (AppNav) is the same
// on every level — Pages list, Variants list, and the editor — so authors keep a
// stable, always-visible way to move between the major areas ("Where am I?" and
// "how do I get back?"). AppShell renders the rail once and slots the current
// view beside it, so no individual view has to know the rail exists.
//
// The rail is context-aware: `activeContext` marks the current major area (Pages
// vs Widgets), and clicking Pages/Widgets navigates to that area's list via a
// hash route. In the editor the shell forwards the same rail with the editor's
// own context handler so switching still swaps the in-editor dataset.
interface AppShellProps {
  // Which major area the rail should show as current.
  activeContext: AuthoringContext;
  // Optional override for rail clicks. The editor passes its in-place context
  // switcher here; browse levels omit it and fall back to route navigation.
  onSelectContext?: (context: AuthoringContext) => void;
  children: ReactNode;
}

export function AppShell({ activeContext, onSelectContext, children }: AppShellProps) {
  // Default rail behaviour (browse levels): navigate to the context's own top
  // list. Pages → #/pages, Widgets → #/widgets. Both collections have the same
  // two top levels (list → variants), so each rail item lands somewhere real.
  const handleSelectContext =
    onSelectContext ??
    ((next: AuthoringContext) => {
      navigate(next === "widget" ? routes.widgets() : routes.pages());
    });

  // V4's visual system is Eos — a light, warm-neutral Material 3 scheme (see
  // ui-lib/tokens.css, whose :root roles now carry the real Eos M3 values). The
  // shell opts into the light theme here; the Live Preview keeps its own light
  // island. (V2's shell used data-theme="dark"; V4 migrates the presentation
  // layer to Eos, so the authoring chrome is light.)
  return (
    <div className="ui-ws-app" data-theme="light">
      <TopBar />
      <div className="ui-ws-shell">
        <AppNav context={activeContext} onSelectContext={handleSelectContext} />
        <main className="ui-ws-shell__main">{children}</main>
      </div>
    </div>
  );
}
