import * as Vuex from "vuex";
import * as Electron from "electron";
import { Grapher } from "../grapher";
import { navigate } from "../route";
import { LogItem, AppActionContext, AppActionTree } from "../rendererTypes";
import { browserActions } from "../browserActions";

const { BrowserWindow, dialog } = Electron.remote;

const actions: RendererActions<AppActionContext> & AppActionTree = {
    error(ctx, e) {
    },
    environmentChanged(ctx, env: Environment) {
        ctx.commit("resetEnvironment", env);
    },
    selectRepository(ctx) {
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
    navigateToRoot(ctx) {
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
        console.log(JSON.stringify(commit, null, 2));
        ctx.commit("setCommitDetail", commit);
    },
    setSelectedIndex(ctx, index) {
        ctx.commit("setSelectedIndex", index);
        const { repoPath, items } = ctx.state;
        browserActions.getCommitDetail(null, repoPath, items[index].commit.id);
    }
};

export default actions;

