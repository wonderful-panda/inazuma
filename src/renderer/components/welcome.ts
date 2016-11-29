import * as Vue from "vue";
import { component } from "vueit";
import { AppStore } from "../rendererTypes";
import { getFileName } from "../utils";

@component<Welcome>({
    compiledTemplate: require("./welcome.pug"),
    methods: {
        getFileName
    }
})
export class Welcome extends Vue {
    $store: AppStore;
    get recentOpened() {
        return this.$store.state.environment.recentOpened;
    }
    openRepository(repoPath: string) {
        this.$store.dispatch("navigateToLog", repoPath);
    }
    selectRepository() {
        this.$store.dispatch("showRepositorySelectDialog", null);
    }
}
