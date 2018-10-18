import "./install-vue";
import Vue, { VNode } from "vue";
import Electron from "electron";
import { store, storeComponent } from "./store";
import { loadMonaco } from "./monaco";
import TheWelcomePage from "./components/TheWelcomePage";
import TheRepositoryPage from "./components/TheRepositoryPage";
loadMonaco();

(function init() {
  const { getPersistentAsJson } = Electron.remote.require("./remote");
  const json = JSON.parse(getPersistentAsJson());
  const config = json.config as Config;
  store.mutations.resetConfig(config);

  try {
    const recentList = JSON.parse(localStorage.getItem("recentList") || "[]");
    if (
      recentList instanceof Array &&
      recentList.every(v => typeof v === "string")
    ) {
      store.mutations.resetRecentList(recentList);
    } else {
      console.warn("Failed to load recentList from localStorage");
    }
  } catch {
    console.warn("Failed to load recentList from localStorage");
  }

  Electron.ipcRenderer.on(
    "action",
    (_event: string, name: string, payload: any) => {
      (store.actions as any)[name](payload);
    }
  );
})();

const initialRepo = sessionStorage.getItem("repoPath");
if (initialRepo) {
  store.actions.showRepositoryPage(initialRepo);
}

store.watch(
  s => s.config.fontFamily,
  value => {
    document.body.style.setProperty(
      "--default-fontfamily",
      value.standard || "Meiryo, Helvetica, Yu Gothic"
    );
    document.body.style.setProperty(
      "--monospace-fontfamily",
      value.monospace || "monospace"
    );
  },
  { immediate: true }
);

store.watch(
  s => s.repoPath,
  value => {
    document.title = value ? `Inazuma (${value})` : "Inazuma";
    sessionStorage.setItem("repoPath", store.state.repoPath);
  },
  { immediate: true }
);

store.watch(
  s => s.recentList,
  value => {
    localStorage.setItem("recentList", JSON.stringify(value));
  }
);

const App = storeComponent.create({
  name: "App",
  mounted() {
    if (initialRepo) {
      store.actions.openRepository(initialRepo);
    }
  },
  render(h): VNode {
    if (this.state.repoPath === "") {
      return h(TheWelcomePage);
    } else {
      return h(TheRepositoryPage);
    }
  }
});

// eslint-disable-next-line no-new
new Vue({
  el: "#app",
  store,
  render(h) {
    return h(App);
  }
});
