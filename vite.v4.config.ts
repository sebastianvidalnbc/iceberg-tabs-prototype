import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { renameSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// V4 (Eos) build target. Serves at
// https://sebastianvidalnbc.github.io/iceberg-v4-eos/
// Entry: v4.html -> src/v4-eos/main.tsx. Output: dist-v4/. Base + outDir are
// distinct from V1 (vite.config.ts) and V2 (vite.v2.config.ts) so none of the
// three builds/deployments ever collide. V4 is a self-contained clone of V2
// (src/v4-eos/**, including its own copy of the shared design system in
// src/v4-eos/ui-lib/**) with the Eos visual system applied on top; V2 is
// untouched.
const V4_OUT_DIR = "dist-v4";

// After the build, rename the emitted v4.html to index.html inside dist-v4/ so
// GitHub Pages serves the V4 app at the base root (…/iceberg-v4-eos/) rather
// than …/iceberg-v4-eos/v4.html. This guarantees a valid index.html entry point
// (avoiding the V3 "404 at root" problem).
function emitIndexHtml() {
  return {
    name: "v4-rename-html-to-index",
    closeBundle() {
      const from = resolve(V4_OUT_DIR, "v4.html");
      const to = resolve(V4_OUT_DIR, "index.html");
      if (existsSync(from)) renameSync(from, to);
    },
  };
}

// In dev, V1's index.html and the other entries live at the repo root, so a
// request for the base root (…/iceberg-v4-eos/) would otherwise be served from
// index.html (the V1 app). This middleware rewrites base-root requests to
// /v4.html so `npm run dev:v4` serves V4 at the base root, matching the build.
function serveV4AtBaseRoot(base: string) {
  return {
    name: "v4-serve-at-base-root",
    configureServer(server: { middlewares: { use: (fn: any) => void } }) {
      const roots = new Set([base, base.replace(/\/$/, ""), "/"]);
      server.middlewares.use((req: any, _res: any, next: any) => {
        const url = (req.url || "").split("?")[0];
        if (roots.has(url)) req.url = `${base}v4.html`;
        next();
      });
    },
  };
}

export default defineConfig({
  base: "/iceberg-v4-eos/",
  plugins: [
    react(),
    tailwindcss(),
    serveV4AtBaseRoot("/iceberg-v4-eos/"),
    emitIndexHtml(),
  ],
  resolve: {
    // "@" → src, used by the V4 shadcn layer (@/v4-eos/ui/...). Mirrors V2.
    alias: { "@": resolve(__dirname, "./src") },
  },
  server: {
    open: "/iceberg-v4-eos/",
  },
  build: {
    outDir: V4_OUT_DIR,
    rollupOptions: {
      // Multi-page build: the CMS app (v4.html → renamed to index.html) and the
      // standalone preview renderer (renderer.html) that the editor iframe loads.
      input: {
        v4: resolve(__dirname, "v4.html"),
        renderer: resolve(__dirname, "renderer.html"),
      },
    },
  },
});
