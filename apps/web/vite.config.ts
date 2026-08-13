import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@cogent/content": path.resolve(root, "content/tracks/index.ts"),
      "@cogent/contracts": path.resolve(root, "packages/contracts/src/index.ts"),
      "@cogent/block-registry": path.resolve(root, "packages/block-registry/src/index.ts"),
      "@cogent/grading-engine": path.resolve(root, "packages/grading-engine/src/index.ts"),
      "@cogent/ui": path.resolve(root, "packages/ui/src/index.tsx"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
