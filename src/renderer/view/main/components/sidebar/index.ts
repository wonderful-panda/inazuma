import Vue from "vue";
import { AppStore } from "../../store";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface SidebarProps {
    title: string;
}

@typed.component<SidebarProps>({
    ...<CompiledTemplate>require("./sidebar.pug"),
    props: {
        title: p.Str.Required
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
        return h(Sidebar, { props: { title: "Branches & Tags" } }, [
            "not implemented"
        ]);
    }
});

export const RemotesBar = Vue.extend({
    render(h) {
        return h(Sidebar, { props: { title: "Remotes" } }, [
            "not implemented"
        ]);
    }
});

