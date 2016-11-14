import * as Vue from "vue";
import { LeftPanelBase } from "./base";

export const BranchesPanel = Vue.extend({
    render(h) {
        return h(LeftPanelBase, { props: { title: "Branches" } }, [
            "not implemented"
        ]);
    }
});
