import * as Vue from "vue";
import * as VueRouter from "vue-router";
import { Welcome } from "./components/welcome";
import { MainWindow } from "./components/mainWindow";

Vue.use(VueRouter);

const routes = [
    { name: "root", path: "/", component: Welcome },
    { name: "log", path: "/:repoPath/log", component: MainWindow },
    { name: "branches", path: "/:repoPath/branches", component: MainWindow }
];

export const router = new VueRouter({ routes });

export const navigate = {
    log(repoPath) {
        router.push({ name: "log", params: { repoPath: encodeURIComponent(repoPath) } });
    },
    root() {
        router.push({ name: "root" });
    }
}
