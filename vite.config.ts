import path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";

// see https://github.com/bvaughn/react-virtualized/issues/1212
const resolveFixup = {
  name: "resolve-fixup",
  setup(build) {
    build.onResolve({ filter: /react-virtualized/ }, async (args) => {
      return {
        path: path.resolve("./node_modules/react-virtualized/dist/umd/react-virtualized.js")
      };
    });
  }
};

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
      plugins: [resolveFixup]
    }
  }
});
