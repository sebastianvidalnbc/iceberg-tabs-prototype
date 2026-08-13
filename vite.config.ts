import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// V1 build target. Serves at https://sebastianvidalnbc.github.io/iceberg-tabs-prototype/
// Entry: index.html -> src/v1/main.tsx. Output: dist/. V2 has its own config
// (vite.v2.config.ts) with a different base and output, so the two builds and
// deployments never overlap.
export default defineConfig({
  base: "/iceberg-tabs-prototype/",
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
