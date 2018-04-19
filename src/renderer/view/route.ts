import VueRouter from "vue-router";
import { store } from "./store";

const routes = [
  {
    path: "/",
    component: () => import("./components/TheWelcomePage.vue")
  },
  {
    path: "/:repoPathEncoded",
    component: () => import("./components/TheRepositoryPage.vue")
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
    router.push(`/${encodeURIComponent(repoPath)}`);
  },
  root() {
    router.push("/");
  }
};
