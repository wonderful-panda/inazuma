import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

export interface SummaryCellProps {
    commit: Commit;
    refs: Ref[];
}

@typed.component<SummaryCellProps>({
    ...<CompiledTemplate>require("./summaryCell.pug"),
    props: {
        commit: p.Obj,
        refs: p.Arr
    }
})
export class SummaryCell extends typed.TypedComponent<SummaryCellProps> {
    refClass(ref: Ref): string {
        switch (ref.type) {
            case "HEAD":
                return "ref-label-head";
            case "heads":
                return ref.current ? "ref-label-branch-current" : "ref-label-branch";
            case "remotes":
                return "ref-label-remote";
            case "tags":
                return "ref-label-tag";
            default:
                return "";
        }
    }
    refText(ref: Ref): string {
        switch (ref.type) {
            case "HEAD":
                return ref.type;
            case "remotes":
                return ref.remote + "/" + ref.name;
            case "heads":
            case "tags":
                return ref.name;
            default:
                return "";
        }
    }
}
