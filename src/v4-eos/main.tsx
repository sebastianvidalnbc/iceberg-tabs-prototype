import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Shared design-system tokens and classes. This entry mounts ONLY V2; V1 has
// its own entry. V2 currently renders a single page (no router yet).
import "./ui-lib/tokens.css";
import "./ui-lib/ui.css";
// V2 shadcn/Tailwind theme layer (dark by default). Loaded AFTER the shared
// tokens so its variables can alias the Iceberg roles. V2-only — never in V1.
import "./styles/theme.css";
// Eos component overlay — loaded LAST so its M3 shape/component refinements win
// at equal specificity over the shared V2 component styles. Presentation-only.
import "./styles/eos.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
