import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/iceberg-tabs-prototype/",
  plugins: [react()],
});
