import * as Vuex from "vuex";
import * as Electron from "electron";
import { Grapher } from "../grapher";
import { navigate } from "../route";
import { LogItem, AppActionContext, AppActionTree } from "../rendererTypes";
import { dispatchBrowser } from "../browser";

const { BrowserWindow, dialog } = Electron.remote;


type ActionHandler<K extends keyof ActionPayload> = (ctx: AppActionContext, payload: ActionPayload[K]) => any;
type Actions = { [K in keyof ActionPayload]: ActionHandler<K> } & AppActionTree;

const actions: Actions = {
    error(ctx, e) {
        // TODO
        console.log(e);
    },
    environmentChanged(ctx, env) {
        ctx.commit("resetEnvironment", env);
    },
    showRepositorySelectDialog(ctx, _) {
        const paths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {properties: ["openDirectory"]});
        if (typeof paths === "undefined") {
            return;
        }
        const repoPath = paths[0].replace(/\\/g, "/").replace(/\/$/, "");
        navigate.log(repoPath);
    },
    navigateToLog(ctx, repoPath) {
        navigate.log(repoPath);
    },
    navigateToRoot(ctx, _) {
        navigate.root();
    },
    showCommits(ctx, commits) {
        const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
        const logItems: LogItem[] = commits.map(c => {
            return { commit: c, graph: grapher.proceed(c) };
        });
        ctx.commit("resetItems", logItems);
    },
    showCommitDetail(ctx, commit) {
        ctx.commit("setCommitDetail", commit);
    },
    setSelectedIndex(ctx, index) {
        ctx.commit("setSelectedIndex", index);
        const { repoPath, items } = ctx.state;
        dispatchBrowser("getCommitDetail", { repoPath, sha: items[index].commit.id });
    }
};

export default actions;

