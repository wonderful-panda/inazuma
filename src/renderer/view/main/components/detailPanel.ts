import Vue from "vue";
import component from "vue-class-component";
import { CommitDetail } from "./commitDetail";
import { WorkingTreeStatus } from "./workingTreeStatus";

@component<DetailPanel>({
    components: { CommitDetail, WorkingTreeStatus },
    ...<CompiledTemplate>require("./detailPanel.pug")
})
export class DetailPanel extends Vue {
}
