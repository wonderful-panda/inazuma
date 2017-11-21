import Vue from "vue";
import * as typed from "vue-typed-component";
import p from "vue-strict-prop";

const mdc: any = require("material-components-web");

interface MainLayoutProps {
    title: string;
}

@typed.component(MainLayout, {
    ...<CompiledTemplate>require("./mainLayout.pug"),
    props: {
        title: p(String).required
    },
    created() {
        Vue.nextTick(() => {
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
        this.$refs.drawer.MDCTemporaryDrawer.open = false;
    }
}
