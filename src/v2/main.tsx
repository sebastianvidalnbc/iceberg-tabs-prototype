import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Shared design-system tokens and classes. This entry mounts ONLY V2; V1 has
// its own entry. V2 currently renders a single page (no router yet).
import "../ui/tokens.css";
import "../ui/ui.css";
// V2 shadcn/Tailwind theme layer (dark by default). Loaded AFTER the shared
// tokens so its variables can alias the Iceberg roles. V2-only — never in V1.
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
