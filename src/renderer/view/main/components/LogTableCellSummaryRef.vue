<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { dragdrop } from "../dragdrop";
import p from "vue-strict-prop";

export default tsx.component({
    name: "LogTableCellSummaryRef",
    props: {
        refObject: p.ofObject<Ref>().required
    },
    computed: {
        className(): string {
            const ref = this.refObject;
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
            const ref = this.refObject;
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
            const ref = this.refObject;
            return ref.type === "heads";
        }
    },
    methods: {
        onDragStart(event: DragEvent) {
            const ref = this.refObject;
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
}, ["refObject"]);
</script>

<style lang="scss">
.ref-label {
    vertical-align: middle;
    height: 1.3em;
    line-height: 1.3em;
    font-size: smaller;
    border: 1px solid;
    margin: auto 4px auto 0;
    padding: 0 0.4em 0 0.4em;
    border-radius: 1em;
    cursor: default;
}

.ref-label-head {
    border-radius: 0;
    font-weight: bold;
    color: darkorange;
    border: 2px solid darkorange;
}

.ref-label-branch {
    color: cyan;
    border-color: cyan;
    cursor: pointer;
}

.ref-label-branch-current {
    font-weight: bold;
    color: cyan;
    border: 2px solid cyan;
    cursor: pointer;
}

.ref-label-tag {
    border-radius: 0;
    color: cyan;
    border-color: cyan;
}

.ref-label-remote {
    color: #888;
    border-color: #888;
}
</style>
