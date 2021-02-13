import "style";
import "./install-vue";
import * as vca from "vue-tsx-support/lib/vca";
import Vue from "vue";
import { store, rootModule, useRootModule } from "./store";
import { asAsyncComponent } from "./utils/async-component";
import TheWelcomePage from "./components/TheWelcomePage";
import { h, onMounted } from "@vue/composition-api";
import { provideErrorHandler } from "./components/injection/errorHandler";
import { provideStorage } from "./components/injection/storage";
import { browserCommand } from "core/browser";

const TheRepositoryPage = asAsyncComponent(async () =>
  import(
    /* webpackChunkName: "therepositorypage", webpackPrefetch: true */
    "./components/TheRepositoryPage"
  ).then((mod) => mod.default)
);

const initialRepo = sessionStorage.getItem("repoPath");

async function init() {
  const root = rootModule.context(store);
  try {
    const config = await browserCommand.getConfig();
    root.commit("resetConfig", { config });
  } catch (error) {
    console.log(error);
  }

  try {
    const recentList = JSON.parse(localStorage.getItem("recentList") || "[]");
    if (recentList instanceof Array && recentList.every((v) => typeof v === "string")) {
      root.commit("resetRecentList", { value: recentList });
    } else {
      console.warn("Failed to load recentList from localStorage");
    }
  } catch {
    console.warn("Failed to load recentList from localStorage");
  }

  window.browserEvents.listen("configChanged", root.actions.configChanged);

  if (initialRepo) {
    root.actions.showRepositoryPage({ repoPath: initialRepo });
  }

  store.watch(
    (s) => s.config.fontFamily,
    (value) => {
      document.body.style.setProperty(
        "--default-fontfamily",
        value.standard || "Meiryo, Helvetica, Yu Gothic"
      );
      document.body.style.setProperty("--monospace-fontfamily", value.monospace || "monospace");
    },
    { immediate: true }
  );

  store.watch(
    (s) => s.repoPath,
    (value) => {
      document.title = value ? `Inazuma (${value})` : "Inazuma";
      sessionStorage.setItem("repoPath", store.state.repoPath);
    },
    { immediate: true }
  );

  store.watch(
    (s) => s.recentList,
    (value) => {
      localStorage.setItem("recentList", JSON.stringify(value));
    }
  );

  const App = vca.component({
    name: "App",
    setup() {
      const rootModule = useRootModule();
      provideStorage({ storage: localStorage, namespace: "" });
      provideErrorHandler({
        handleError: (e) => {
          console.log(e);
          rootModule.actions.showError(e);
        }
      });
      onMounted(() => {
        if (initialRepo) {
          rootModule.actions.openRepository({ repoPath: initialRepo });
        }
      });
      return () => {
        return h(rootModule.state.repoPath === "" ? TheWelcomePage : TheRepositoryPage);
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
}

init();
