import * as Electron from "electron";
import { Grapher } from "core/grapher";
import { navigate } from "../route";
import { LogItem, AppActionContext, AppActionTree, ActionPayload } from "../mainTypes";
import { browserCommand } from "core/browser";

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
    configChanged(ctx, config) {
        ctx.commit("resetConfig", config);
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
    async setSelectedIndex(ctx, index) {
        if (ctx.state.selectedIndex === index) {
            return;
        }
        ctx.commit("setSelectedIndex", index);
        const { repoPath, items } = ctx.state;
        const detail = await browserCommand.getCommitDetail({ repoPath, sha: items[index].commit.id });
        ctx.dispatch("showCommitDetail", detail);
    },
    showSidebar(ctx, name) {
        ctx.commit("setSidebarName", name);
    },
    hideSidebar(ctx, _) {
        ctx.commit("setSidebarName", "");
    },
    async resetConfig(ctx, config) {
        await browserCommand.resetConfig(config);
    },
    async runInteractiveShell(ctx, _) {
        await browserCommand.runInteractiveShell(ctx.state.repoPath);
    }
};

export default actions;

