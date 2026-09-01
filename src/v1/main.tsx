import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Shared design-system tokens and classes load first so V1's index.css can
// still override where needed. This entry mounts ONLY V1; V2 has its own entry.
import "../ui/tokens.css";
import "../ui/ui.css";
import "./index.css";
// Production Iceberg visual language for the main editor column. Loads last so
// its `.ib-editor`-scoped rules win over the generic prototype styling.
import "./iceberg-editor.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
