import Vue, { VNode } from "vue";
import { CommitDetail } from "./commitDetail";
import { WorkingTreeStatus } from "./workingTreeStatus";
import { AppStore } from "view/main/store";

export const DetailPanel = Vue.extend({
    render(): VNode {
        const store = this.$store as AppStore;
        if (store.state.selectedCommit.id === "--") {
            return <keep-alive><WorkingTreeStatus /></keep-alive>;
        } else {
            return <keep-alive><CommitDetail /></keep-alive>;
        }
    }
});
