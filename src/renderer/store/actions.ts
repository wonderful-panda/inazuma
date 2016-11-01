import * as Vuex from "vuex";
import { Grapher } from "../../grapher";
import { navigate } from "../route";
import { LogItem, AppActionContext, AppActionTree } from "../rendererTypes";

const actions: RendererActions<AppActionContext> & AppActionTree = {
    error(ctx, e) {
    },
    environmentChanged(ctx, env) {
        ctx.commit("resetEnvironment", env);
    },
    navigateToLog(ctx, repoPath) {
        navigate.log(repoPath);
    },
    showCommits(ctx, commits) {
        const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
        const logItems: LogItem[] = commits.map(c => {
            return { commit: c, graph: grapher.proceed(c) };
        });
        ctx.commit("resetItems", logItems);
    }
};

export default actions;

