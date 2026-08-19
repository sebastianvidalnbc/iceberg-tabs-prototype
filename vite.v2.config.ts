import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { renameSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// V2 build target. Serves at https://sebastianvidalnbc.github.io/iceberg-v2-prototype/
// Entry: v2.html -> src/v2/main.tsx. Output: dist-v2/. Separate base + outDir
// from V1 so the two builds/deployments never collide.
//
// The entry file is v2.html (so it can coexist with V1's index.html at the repo
// root during local dev). After the build we rename the emitted v2.html to
// index.html inside dist-v2/, so GitHub Pages serves the V2 app at the base
// root (…/iceberg-v2-prototype/) rather than …/iceberg-v2-prototype/v2.html.
const V2_OUT_DIR = "dist-v2";

function emitIndexHtml() {
  return {
    name: "v2-rename-html-to-index",
    closeBundle() {
      const from = resolve(V2_OUT_DIR, "v2.html");
      const to = resolve(V2_OUT_DIR, "index.html");
      if (existsSync(from)) renameSync(from, to);
    },
  };
}

// In dev, V1's index.html and V2's v2.html both live at the repo root, so a
// request for the base root (…/iceberg-v2-prototype/) would otherwise be served
// by Vite from index.html — i.e. the V1 app. This middleware rewrites base-root
// requests to /v2.html so `npm run dev:v2` serves V2 at the base root, matching
// the deployed build (where v2.html is renamed to index.html).
function serveV2AtBaseRoot(base: string) {
  return {
    name: "v2-serve-at-base-root",
    configureServer(server: { middlewares: { use: (fn: any) => void } }) {
      const roots = new Set([base, base.replace(/\/$/, ""), "/"]);
      server.middlewares.use((req: any, _res: any, next: any) => {
        const url = (req.url || "").split("?")[0];
        if (roots.has(url)) req.url = `${base}v2.html`;
        next();
      });
    },
  };
}

export default defineConfig({
  base: "/iceberg-v2-prototype/",
  plugins: [react(), serveV2AtBaseRoot("/iceberg-v2-prototype/"), emitIndexHtml()],
  // During dev, V1's index.html and V2's v2.html both live at the repo root. The
  // serveV2AtBaseRoot middleware rewrites the base root to v2.html so the V2 app
  // is served at …/iceberg-v2-prototype/ (matching the deployed build). Auto-open
  // that URL so `npm run dev:v2` lands on the V2 shell.
  server: {
    open: "/iceberg-v2-prototype/",
  },
  build: {
    outDir: V2_OUT_DIR,
    rollupOptions: {
      input: resolve(__dirname, "v2.html"),
    },
  },
});
