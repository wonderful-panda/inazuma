import path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";
import reactJsx from "vite-react-jsx";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src/react",
  base: "./",
  plugins: [reactJsx(), reactRefresh()],
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
