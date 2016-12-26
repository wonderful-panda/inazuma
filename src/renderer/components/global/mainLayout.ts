import * as Vue from "vue";
import * as typed from "vue-typed-component";
const p = typed.PropOptions;

interface MainLayoutProps {
    title: string;
}

@typed.component<MainLayoutProps>({
    ...<CompiledTemplate>require("./main-layout.pug"),
    props: {
        title: p.Str.Required
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
