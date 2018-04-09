import "./install-vue";
import Vue from "vue";
import { Route } from "vue-router";

import * as Electron from "electron";
import { store } from "./store";
import { router } from "./route";
import { browserCommand } from "core/browser";
import * as ds from "view/common/displayState";

const environment = Electron.remote.getGlobal("environment") as Environment;
if (environment.displayState) {
  ds.initDataStore(environment.displayState, "main/");
}

window.addEventListener("beforeunload", () => {
  browserCommand.saveDisplayState(ds.dataStore);
  return undefined;
});

Electron.ipcRenderer.on(
  "action",
  (_event: string, name: string, payload: any) => {
    (store.actions as any)[name](payload);
  }
);

// eslint-disable-next-line no-new
new Vue({
  el: "#app",
  store,
  router,
  watch: {
    $route: "onRouteChanged",
    "$store.state.config.fontFamily": {
      handler({ standard, monospace }: Config["fontFamily"]) {
        document.body.style.setProperty("--default-fontfamily", standard);
        document.body.style.setProperty("--monospace-fontfamily", monospace);
      },
      immediate: true
    }
  },
  created(this: any) {
    this.onRouteChanged();
  },
  methods: {
    async onRouteChanged() {
      const route: Route = this.$route;
      const { repoPathEncoded } = route.params;
      const repoPath = repoPathEncoded
        ? decodeURIComponent(repoPathEncoded)
        : "";
      if (store.state.repoPath !== repoPath) {
        store.mutations.setRepoPath(repoPath);
        document.title = repoPath ? `Inazuma (${repoPath})` : "Inazuma";
        if (repoPath) {
          try {
            const { commits, refs } = await browserCommand.openRepository(
              repoPath
            );
            store.actions.showCommits(commits, refs);
          } catch (e) {
            store.actions.showError(e);
          }
        }
      }
    }
  },
  render(h) {
    return h("router-view");
  }
});
