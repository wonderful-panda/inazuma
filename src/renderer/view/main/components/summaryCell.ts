import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

export interface SummaryCellProps {
    commit: Commit;
}

@typed.component<SummaryCellProps>({
    ...<CompiledTemplate>require("./summaryCell.pug"),
    props: {
        commit: p.Obj
    }
})
export class SummaryCell extends typed.TypedComponent<SummaryCellProps> {
    refClass(ref: Ref): string {
        switch (ref.type) {
            case "HEAD":
            case "MERGE_HEAD":
                return "ref-label-head";
            case "heads":
                return "ref-label-branch";
            case "remotes":
                return "ref-label-remote";
            case "tags":
                return "ref-label-tag";
            default:
                return "ref-label-others";
        }
    }
    refText(ref: Ref): string {
        switch (ref.type) {
            case "HEAD":
            case "MERGE_HEAD":
                return ref.type;
            case "remotes":
                return ref.remote + "/" + ref.name;
            default:
                return ref.name;
        }
    }
}
