import Vue from "vue";
import component from "vue-class-component";
import { AppStore } from "../mainTypes";
import { getFileName } from "core/utils";

@component<Welcome>({
    ...<CompiledTemplate>require("./welcome.pug"),
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
