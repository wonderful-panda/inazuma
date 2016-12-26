import * as Vue from "vue";
import * as typed from "vue-typed-component";
import { PropOptions } from "../propOptions";

interface MainLayoutProps {
    title: string;
}

@typed.component<MainLayoutProps, MainLayout>({
    ...<CompiledTemplate>require("./main-layout.pug"),
    props: {
        title: PropOptions.stringRequired()
    },
    created() {
        Vue.nextTick(() => {
            componentHandler.upgradeDom();
        });
    }
})
export class MainLayout extends typed.TypedComponent<MainLayoutProps> {
    toggleDrawer() {
        (this.$el as any).MaterialLayout.toggleDrawer();
    }
}
