import "./install-vue";
import Vue from "vue";
import * as Electron from "electron";
import * as ds from "view/store/displayState";
import { store } from "./store";
import { router } from "./route";
import { browserCommand } from "core/browser";
import { loadMonaco } from "./monaco";
loadMonaco();

(function init() {
  const { getPersistentAsJson } = Electron.remote.require("./remote");
  const json = JSON.parse(getPersistentAsJson());
  const config = json.config as Config;
  const environment = json.environment as Environment;
  ds.initDataStore(environment.displayState.main);
  store.mutations.resetConfig(config);
  store.mutations.resetEnvironment(environment);

  window.addEventListener("beforeunload", () => {
    browserCommand.saveDisplayState({ key: "main", value: ds.dataStore });
    return undefined;
  });

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
