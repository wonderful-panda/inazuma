import Vue from "vue";
import VueRouter from "vue-router";
import { Welcome } from "./components/welcome";
import { MainWindow } from "./components/mainWindow";

const routes = [
    {
        name: "root", path: "/", component: Welcome
    },
    {
        name: "log", path: "/:repoPathEncoded", component: MainWindow,
        children: [
        ]
    },
];

export const router = new VueRouter({ routes });

export const navigate = {
    log(repoPath) {
        router.push({ name: "log", params: { repoPathEncoded: encodeURIComponent(repoPath) } });
    },
    root() {
        router.push({ name: "root" });
    }
};
