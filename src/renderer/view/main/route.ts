import Vue from "vue";
import VueRouter from "vue-router";
import { Welcome } from "./components/welcome";
import { MainWindow } from "./components/mainWindow";
import { Preference } from "./components/modal/preference";

const routes = [
    {
        name: "root", path: "/", component: Welcome,
        children: [
            { name: "preference", path: "preference", component: Preference }
        ]
    },
    {
        name: "log", path: "/:repoPathEncoded", component: MainWindow,
        children: [
            { name: "log/preference", path: "preference", component: Preference }
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
