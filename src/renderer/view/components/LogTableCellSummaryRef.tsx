import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { dragdrop } from "../dragdrop";
import p from "vue-strict-prop";
import * as style from "./LogTableCellSummaryRef.scss";

export default tsx.component(
  // @vue/component
  {
    name: "LogTableCellSummaryRef",
    props: {
      refObject: p.ofObject<Ref>().required
    },
    computed: {
      className(): string {
        const ref = this.refObject;
        switch (ref.type) {
          case "HEAD":
            return style.head;
          case "heads":
            return ref.current ? style.currentBranch : style.branch;
          case "remotes":
            return style.remote;
          case "tags":
            return style.tag;
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
          dragdrop.setData(event, "git/branch", {
            name: ref.name,
            isCurrent: ref.current
          });
        }
      }
    },
    render(): VNode {
      return (
        <span
          class={this.className}
          domProps-draggable={this.draggable}
          onDragstart={this.onDragStart}
        >
          {this.text}
        </span>
      );
    }
  },
  ["refObject"]
);
