import Vue from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

const mdc: any = require("material-components-web");

interface MainLayoutProps {
    title: string;
}

export const MainLayout = tsx.component({
    name: "MainLayout",
    ...<CompiledTemplate>require("./mainLayout.pug"),
    props: {
        title: p(String).required
    },
    data() {
        return { menuVisible: false };
    },
    created() {
        Vue.nextTick(() => {
            mdc.autoInit();
        });
    },
    methods: {
        toggleMenu(): void {
            this.menuVisible = !this.menuVisible;
        }
    }
});

