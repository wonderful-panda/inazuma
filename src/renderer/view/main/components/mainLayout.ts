import Vue from "vue";
import * as mdc from "material-components-web";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface MainLayoutProps {
    title: string;
}

@typed.component<MainLayoutProps>({
    ...<CompiledTemplate>require("./mainLayout.pug"),
    props: {
        title: p.Str.Required
    },
    created() {
        Vue.nextTick(() => {
            componentHandler.upgradeDom();
            mdc.autoInit();
        });
    }
})
export class MainLayout extends typed.TypedComponent<MainLayoutProps> {
    $refs: { drawer: HTMLElement & { MDCTemporaryDrawer: any } };
    openDrawer() {
        this.$refs.drawer.MDCTemporaryDrawer.open = true;
    }
    closeDrawer() {
        console.log("closeDrawer");
        this.$refs.drawer.MDCTemporaryDrawer.open = false;
    }
}
