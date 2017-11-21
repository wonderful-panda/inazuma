import Vue from "vue";
import { AppStore } from "../../store";
import * as typed from "vue-typed-component";
import p from "vue-strict-prop";

interface SidebarProps {
    title: string;
}

@typed.component<SidebarProps>({
    ...(require("./sidebar.pug") as CompiledTemplate),
    props: {
        title: p(String).required
    }
})
export class Sidebar extends typed.TypedComponent<SidebarProps> {
    $store: AppStore;

    close() {
        this.$store.actions.hideSidebar();
    }
}

export const BranchesBar = Vue.extend({
    render(h) {
        return <Sidebar title="Branches & Tags">not implemented</Sidebar>;
    }
});

export const RemotesBar = Vue.extend({
    render(h) {
        return <Sidebar title="Remotes">not implemented</Sidebar>;
    }
});

