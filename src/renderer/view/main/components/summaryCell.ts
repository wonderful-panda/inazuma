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
    get refs(): Ref[] {
        const { refs } = this.$props.commit;
        if (refs) {
            return refs.filter(r => r.type !== "MERGE_HEAD");
        }
        else {
            return [];
        }
    }
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
                return ref.name;
            default:
                return "";
        }
    }
}