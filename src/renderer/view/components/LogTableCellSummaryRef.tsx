import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { dragdrop } from "../dragdrop";
import p from "vue-strict-prop";

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

const style = css`
  .base {
    vertical-align: middle;
    height: 14px;
    line-height: 14px;
    font-size: 12px;
    border: 1px solid;
    margin: auto 4px auto 0;
    padding: 0 0.4em 0 0.4em;
    border-radius: 1em;
    box-sizing: content-box;
    cursor: default;
  }

  .${"head"} {
    @extend .base;
    border-radius: 2px;
    color: darkorange;
    font-weight: bolder;
    border: 2px solid darkorange;
  }

  .${"branch"} {
    @extend .base;
    color: cyan;
    border-color: cyan;
    cursor: pointer;
  }

  .${"currentBranch"} {
    @extend .base;
    color: cyan;
    border: 2px solid cyan;
    cursor: pointer;
  }

  .${"tag"} {
    @extend .base;
    border-radius: 0;
    color: cyan;
    border-color: cyan;
  }

  .${"remote"} {
    @extend .base;
    color: #888;
    border-color: #888;
  }
`;
