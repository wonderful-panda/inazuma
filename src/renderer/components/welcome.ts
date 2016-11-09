import * as Vue from "vue";
import * as Vuex from "vuex";
import { component } from "vueit";
import { AppState } from "../rendererTypes";
import { stripDotGit, getRepoName } from "../utils";

@component<Welcome>({
    compiledTemplate: require("./welcome.pug"),
    methods: {
        stripDotGit,
        getRepoName
    }
})
export class Welcome extends Vue {
    $store: Vuex.Store<AppState>;
    get recentOpened() {
        return this.$store.state.environment.recentOpened;
    }
    openRepository(repoPath: string) {
        this.$store.dispatch("navigateToLog", repoPath);
    }
    selectRepository(repoPath: string) {
        this.$store.dispatch("selectRepository");
    }
}
