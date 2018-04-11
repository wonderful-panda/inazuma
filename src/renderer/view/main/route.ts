import VueRouter from "vue-router";
import { store } from "./store";

const routes = [
  {
    name: "root",
    path: "/",
    component: () => import("./components/TheWelcomePage.vue"),
    children: [
      {
        name: "preference",
        path: "preference",
        component: () => import("./components/ThePreferencePage.vue")
      }
    ]
  },
  {
    name: "log",
    path: "/:repoPathEncoded",
    component: () => import("./components/TheRevisionLogPage.vue"),
    children: [
      {
        name: "log/preference",
        path: "preference",
        component: () => import("./components/ThePreferencePage.vue")
      }
    ]
  }
];

export const router = new VueRouter({ routes });

router.beforeEach(async (to, _from, next) => {
  const { repoPathEncoded } = to.params;
  const repoPath = repoPathEncoded ? decodeURIComponent(repoPathEncoded) : "";
  await store.actions.setRepositoryPath(repoPath);
  if (store.state.repoPath === repoPath) {
    next();
  } else {
    next(false);
  }
});

export const navigate = {
  log(repoPath: string) {
    router.push({
      name: "log",
      params: { repoPathEncoded: encodeURIComponent(repoPath) }
    });
  },
  root() {
    router.push({ name: "root" });
  }
};
