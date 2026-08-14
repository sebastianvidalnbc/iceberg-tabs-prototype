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

export default defineConfig({
  base: "/iceberg-v2-prototype/",
  plugins: [react(), emitIndexHtml()],
  // During dev, V1's index.html and V2's v2.html both live at the repo root, so
  // Vite would serve V1 at the base root. Auto-open v2.html so `npm run dev:v2`
  // lands on the V2 shell. (The build renames v2.html -> index.html, so the
  // deployed site still serves V2 at the base root.)
  server: {
    open: "/iceberg-v2-prototype/v2.html",
  },
  build: {
    outDir: V2_OUT_DIR,
    rollupOptions: {
      input: resolve(__dirname, "v2.html"),
    },
  },
});
