import * as VueRouter from "vue-router";
import * as typed from "vue-typed-component";

interface LeftPanelBaseProps {
    title: string;
}

@typed.component<LeftPanelBaseProps, LeftPanelBase>({
    ...<CompiledTemplate>require("./base.pug"),
    props: {
        title: String
    }
})
export class LeftPanelBase extends typed.TypedComponent<LeftPanelBaseProps> {
    $router: VueRouter;
    $route: VueRouter.Route;

    navigateToLog() {
        this.$router.replace({ name: "log", params: this.$route.params });
    }
}
