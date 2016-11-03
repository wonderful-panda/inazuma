import * as Vue from "vue";
import * as VueRouter from "vue-router";
import { Welcome } from "./components/welcome";
import { LogView } from "./components/logView";

Vue.use(VueRouter);

const routes = [
    { name: "root", path: "/", component: Welcome },
    { name: "log", path: "/log/:repoPath", component: LogView }
];

export const router = new VueRouter({ routes });

export const navigate = {
    log(repoPath) {
        router.push({ name: "log", params: { repoPath } });
    },
    root() {
        router.push({ name: "root" });
    }
}
