import path from "node:path";
import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "./src/react",
  base: "./",
  plugins: [react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }), tailwindcss()],
  build: {
    sourcemap: "inline",
    outDir: "../../dist",
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "SOURCEMAP_ERROR") {
          return;
        }
        defaultHandler(warning);
      }
    }
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src/react") },
      { find: "@backend", replacement: path.resolve(__dirname, "./src-tauri/types/bindings") }
    ]
  }
});
