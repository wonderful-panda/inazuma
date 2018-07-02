import "./install-vue";
import Vue from "vue";
import Electron from "electron";
import { store } from "./store";
import { router } from "./route";
import { loadMonaco } from "./monaco";
loadMonaco();

(function init() {
  const { getPersistentAsJson } = Electron.remote.require("./remote");
  const json = JSON.parse(getPersistentAsJson());
  const config = json.config as Config;
  const environment = json.environment as Environment;
  store.mutations.resetConfig(config);
  store.mutations.resetEnvironment(environment);

  Electron.ipcRenderer.on(
    "action",
    (_event: string, name: string, payload: any) => {
      (store.actions as any)[name](payload);
    }
  );
})();

// eslint-disable-next-line no-new
new Vue({
  el: "#app",
  store,
  router,
  watch: {
    "$store.state.config.fontFamily": {
      handler({ standard, monospace }: Config["fontFamily"]) {
        document.body.style.setProperty(
          "--default-fontfamily",
          standard || "Meiryo, Helvetica, Yu Gothic"
        );
        document.body.style.setProperty(
          "--monospace-fontfamily",
          monospace || "monospace"
        );
      },
      immediate: true
    },
    "$store.state.repoPath": {
      handler(value: string) {
        document.title = value ? `Inazuma (${value})` : "Inazuma";
      },
      immediate: true
    }
  },
  render(h) {
    return h("router-view");
  }
});
