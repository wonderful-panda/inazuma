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
    toggleDrawer() {
        (this.$el as any).MaterialLayout.toggleDrawer();
    }
}
