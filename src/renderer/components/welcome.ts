import * as Vue from "vue";
import * as Vuex from "vuex";
import { component } from "vueit";
import { AppState } from "../rendererTypes";
import { navigate } from "../route";

@component<Welcome>({
    compiledTemplate: require("./welcome.pug")
})
export class Welcome extends Vue {
    $store: Vuex.Store<AppState>;
    get recentOpened() {
        return this.$store.state.environment.recentOpened;
    }
    stripDotGit(repoPath: string) {
        return repoPath.replace(/\/\.git(\/)$/, "");
    }
    getRepoName(repoPath: string) {
        return this.stripDotGit(repoPath).split("/").pop();
    }
    openRepository(repoPath: string) {
        navigate.log(repoPath);
    }
}
