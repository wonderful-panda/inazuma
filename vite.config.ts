import path from "path";
import preactRefresh from "@prefresh/vite";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src/react",
  base: "./",
  plugins: [preactRefresh()],
  build: {
    sourcemap: "inline",
    outDir: "../../dist/renderer"
  },
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxInject: "import { h, Fragment } from 'preact'"
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src/react") },
      { find: "react", replacement: "preact/compat" },
      { find: "react-dom", replacement: "preact/compat" }
    ]
  }
});
