import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/react/test/setup.ts"]
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src/react") },
      { find: "@backend", replacement: path.resolve(__dirname, "./src-tauri/types/bindings") },
      {
        find: "@tauri-apps/api/core",
        replacement: path.resolve(__dirname, "./src/react/test/mocks/tauri.ts")
      }
    ]
  }
});
