import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { dragdrop } from "../dragdrop";

interface RefLabelProps {
    ref_: Ref;
}

@typed.component<RefLabelProps, RefLabel>({
    props: { ref_: p.Obj.Required },
    render(h) {
        return h("div", {
            class: ["ref-label", this.className],
            domProps: { draggable: this.draggable },
            on: { dragstart: this.onDragStart }
        }, this.text);
    }
})
class RefLabel extends typed.TypedComponent<RefLabelProps> {
    get className() {
        const ref = this.$props.ref_;
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
    get text() {
        const ref = this.$props.ref_;
        switch (ref.type) {
            case "HEAD":
                return ref.type;
            case "remotes":
                return ref.remote + "/" + ref.name;
            case "heads":
            case "tags":
                return ref.name;
            default:
                return ref.fullname;
        }
    }
    get draggable() {
        const ref = this.$props.ref_;
        return ref.type === "heads";
    }
    onDragStart(event: DragEvent) {
        const ref = this.$props.ref_;
        if (ref.type === "heads") {
            event.dataTransfer.effectAllowed = "move";
            dragdrop.setData(event, "git/branch", { name: ref.name, isCurrent: ref.current });
        }
    }
}

export interface SummaryCellProps {
    commit: Commit;
    refs: Ref[];
}

@typed.component<SummaryCellProps>({
    ...<CompiledTemplate>require("./summaryCell.pug"),
    components: { RefLabel },
    props: {
        commit: p.Obj.Required,
        refs: p.Arr.Required
    }
})
export class SummaryCell extends typed.TypedComponent<SummaryCellProps> {
}
