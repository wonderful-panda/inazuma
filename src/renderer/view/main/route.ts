import Vue from "vue";
import VueRouter from "vue-router";

const routes = [
    {
        name: "root", path: "/", component: () => import("./components/welcome"),
        children: [
            { name: "preference", path: "preference", component: () => import("./components/modal/preference") }
        ]
    },
    {
        name: "log", path: "/:repoPathEncoded", component: () => import("./components/mainWindow"),
        children: [
            { name: "log/preference", path: "preference", component: () => import("./components/modal/preference")}
        ]
    },
];

export const router = new VueRouter({ routes });

export const navigate = {
    log(repoPath: string) {
        router.push({ name: "log", params: { repoPathEncoded: encodeURIComponent(repoPath) } });
    },
    root() {
        router.push({ name: "root" });
    }
};
