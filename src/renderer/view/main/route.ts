import Vue from "vue";
import VueRouter from "vue-router";

const routes = [
    {
        name: "root", path: "/", component: () => import("./components/TheWelcomePage.vue"),
        children: [
            { name: "preference", path: "preference", component: () => import("./components/ThePreferencePage.vue") }
        ]
    },
    {
        name: "log", path: "/:repoPathEncoded", component: () => import("./components/TheRevisionLogPage.vue"),
        children: [
            { name: "log/preference", path: "preference", component: () => import("./components/ThePreferencePage.vue")}
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
