import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src/react",
  base: "./",
  plugins: [react()],
  build: {
    sourcemap: "inline",
    outDir: "../../dist"
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src/react") },
      { find: "@backend", replacement: path.resolve(__dirname, "./src-tauri/types/bindings") }
    ]
  }
});
