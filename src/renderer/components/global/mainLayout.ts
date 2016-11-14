import * as Vue from "vue";
import { component, prop } from "vueit";

@component({
    compiledTemplate: require("./main-layout.pug"),
    created() {
        Vue.nextTick(() => {
            componentHandler.upgradeDom();
        });
    }
})
export class MainLayout extends Vue {
    @prop.required title: string;
    @prop.default(() => []) navigations: { name: string, text: string, icon: string, params: any }[];
    toggleDrawer() {
        (this.$el as any).MaterialLayout.toggleDrawer();
    }
}
