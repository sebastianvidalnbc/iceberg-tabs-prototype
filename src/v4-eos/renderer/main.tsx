import React from "react";
import ReactDOM from "react-dom/client";
import { RendererApp } from "./RendererApp";
import "./brand.css";

// Entry for the preview iframe (renderer.html). Deliberately mounts ONLY the
// customer brand render + its own self-contained brand.css — none of the CMS
// chrome, tokens, or Eos component layer — so the previewed page and the tool
// are fully decoupled documents, the way the SSR renderer service is in prod.
ReactDOM.createRoot(document.getElementById("preview-root")!).render(
  <React.StrictMode>
    <RendererApp />
  </React.StrictMode>
);
