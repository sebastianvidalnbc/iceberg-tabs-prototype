import type { ReactNode } from "react";
import { AppNav } from "./regions/AppNav";
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

  // V2's default visual theme is dark. The theme is opted into here — on the
  // shell that wraps every V2 level — via `data-theme`, which flips the semantic
  // color roles in tokens.css to their dark values. V1 never sets this attribute
  // (and mounts in a separate build), so V1 stays on the light `:root` theme.
  // Kept as a single attribute so a future theme switch is a one-line change.
  return (
    <div className="ui-ws-shell" data-theme="dark">
      <AppNav context={activeContext} onSelectContext={handleSelectContext} />
      <main className="ui-ws-shell__main">{children}</main>
    </div>
  );
}
