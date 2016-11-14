import * as Vue from "vue";
import * as VueRouter from "vue-router";
import { component, prop } from "vueit";

@component({
    compiledTemplate: require("./base.pug")
})
export class LeftPanelBase extends Vue {
    $router: VueRouter;
    $route: VueRouter.Route;
    @prop.required title: string;

    navigateToLog() {
        this.$router.replace({ name: "log", params: this.$route.params });
    }
}
