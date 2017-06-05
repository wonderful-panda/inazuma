import Vue from "vue";
import { LeftPanelBase } from "./base";

export const RemotesPanel = Vue.extend({
    render(h) {
        return h(LeftPanelBase, { props: { title: "Remotes" } }, [
            "not implemented"
        ]);
    }
});
