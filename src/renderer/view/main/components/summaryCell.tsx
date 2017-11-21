import Vue, { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import * as typed from "vue-typed-component";
import p from "vue-strict-prop";
import { dragdrop } from "../dragdrop";

const RefLabel = tsx.component({
    props: { ref_: p.ofObject<Ref>().required },
    computed: {
        className(): string {
            const ref = this.ref_;
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
        },
        text(): string {
            const ref = this.ref_;
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
        },
        draggable(): boolean {
            const ref = this.ref_;
            return ref.type === "heads";
        }
    },
    methods: {
        onDragStart(event: DragEvent) {
            const ref = this.ref_;
            if (ref.type === "heads") {
                event.dataTransfer.effectAllowed = "move";
                dragdrop.setData(event, "git/branch", { name: ref.name, isCurrent: ref.current });
            }
        }
    },
    render(): VNode {
        return (
            <div
              staticClass="ref-label"
              class={this.className}
              domProps-draggable={this.draggable}
              onDragstart={this.onDragStart}
            >
              { this.text }
            </div>
        );
    }
}, ["ref_"]);

export const SummaryCell = tsx.component({
    props: {
        commit: p.ofObject<Commit>().required,
        refs: p.ofRoArray<Ref>().required
    },
    render(): VNode {
        return (
            <transition-group tag="div" style={{ display: "flex", flexFlow: "row nowrap" }}>
              { this.refs.map(r => <RefLabel key={r.fullname} ref_={r} />) }
                <span key="summary">{this.commit.summary}</span>)
            </transition-group>
        )
    }
});
