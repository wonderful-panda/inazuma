import path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src/react",
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: "import React from 'react';"
  },
  build: {
    sourcemap: true
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src/react") }]
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        /* resolveFixup */
      ]
    }
  }
});
