import "./install-vue";
import * as vca from "vue-tsx-support/lib/vca";
import Vue from "vue";
import Electron from "electron";
import { store, rootModule, useRootModule } from "./store";
import { asAsyncComponent } from "./utils/async-component";
import TheWelcomePage from "./components/TheWelcomePage";
import { createElement, onMounted } from "@vue/composition-api";

const TheRepositoryPage = asAsyncComponent(async () =>
  import(
    /* webpackChunkName: "therepositorypage", webpackPrefetch: true */
    "./components/TheRepositoryPage"
  ).then(mod => mod.default)
);

const initialRepo = sessionStorage.getItem("repoPath");

(function init() {
  const { getPersistentAsJson } = Electron.remote.require("./remote");
  const json = JSON.parse(getPersistentAsJson());
  const config = json.config as Config;
  const root = rootModule.context(store);
  root.commit("resetConfig", { config });

  try {
    const recentList = JSON.parse(localStorage.getItem("recentList") || "[]");
    if (
      recentList instanceof Array &&
      recentList.every(v => typeof v === "string")
    ) {
      root.commit("resetRecentList", { value: recentList });
    } else {
      console.warn("Failed to load recentList from localStorage");
    }
  } catch {
    console.warn("Failed to load recentList from localStorage");
  }

  Electron.ipcRenderer.on("action", (_event, name: string, payload: any) => {
    store.dispatch(name, payload);
  });
  if (initialRepo) {
    root.actions.showRepositoryPage({ repoPath: initialRepo });
  }
})();

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

const App = vca.component({
  name: "App",
  setup() {
    const rootModule = useRootModule();
    onMounted(() => {
      if (initialRepo) {
        rootModule.actions.openRepository({ repoPath: initialRepo });
      }
    });
    return () => {
      return createElement(
        rootModule.state.repoPath === "" ? TheWelcomePage : TheRepositoryPage
      );
    };
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
