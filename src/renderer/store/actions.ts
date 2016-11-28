import * as Vuex from "vuex";
import * as Electron from "electron";
import { Grapher } from "../grapher";
import { navigate } from "../route";
import { LogItem, AppActionContext, AppActionTree } from "../rendererTypes";
import { dispatchBrowser } from "../browser";

const { BrowserWindow, dialog } = Electron.remote;

const actions: any & AppActionTree = {};

function register(type: keyof ActionPayload, handler: never): void;
function register<K extends keyof ActionPayload>(type: K, handler: (ctx: AppActionContext, payload: ActionPayload[K]) => any): void;
function register(type, handler) {
    actions[type] = handler;
}

register("error", (ctx, e) => {
    // TODO
    console.log(e);
});

register("environmentChanged", (ctx, env) => {
    ctx.commit("resetEnvironment", env);
});

register("selectRepository", (ctx, _) => {
        const paths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {properties: ["openDirectory"]});
        if (typeof paths === "undefined") {
            return;
        }
        const repoPath = paths[0].replace(/\\/g, "/").replace(/\/$/, "");
        navigate.log(repoPath);
});

register("navigateToLog", (ctx, repoPath) => {
    navigate.log(repoPath);
});

register("navigateToRoot", (ctx, _) => {
    navigate.root();
});

register("showCommits", (ctx, commits) => {
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const logItems: LogItem[] = commits.map(c => {
        return { commit: c, graph: grapher.proceed(c) };
    });
    ctx.commit("resetItems", logItems);
});

register("showCommitDetail", (ctx, commit) => {
    ctx.commit("setCommitDetail", commit);
});

register("setSelectedIndex", (ctx, index) => {
    ctx.commit("setSelectedIndex", index);
    const { repoPath, items } = ctx.state;
    dispatchBrowser("getCommitDetail", { repoPath, sha: items[index].commit.id });
});

export default actions;

