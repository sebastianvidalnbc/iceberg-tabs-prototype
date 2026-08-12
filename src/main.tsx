import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Design-system tokens and shared classes load first so legacy index.css can
// still override during the incremental migration.
import "./ui/tokens.css";
import "./ui/ui.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
