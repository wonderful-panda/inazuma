import Vue from "vue";
import component from "vue-class-component";
import { AppStore } from "../store";
import { MainLayout } from "./mainLayout";
import { getFileName } from "core/utils";
import { NavigationLink } from "./navigationLink";

@component<Welcome>({
    components: { MainLayout, NavigationLink },
    ...<CompiledTemplate>require("./welcome.pug"),
    methods: {
        getFileName
    }
})
export default class Welcome extends Vue {
    $store: AppStore;
    get recentOpened() {
        return this.$store.state.environment.recentOpened;
    }
    openRepository(repoPath: string) {
        this.$store.actions.navigateToLog(repoPath);
    }
    selectRepository() {
        this.$store.actions.showRepositorySelectDialog();
    }
}
