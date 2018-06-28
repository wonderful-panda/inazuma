import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { px } from "core/utils";
import { CssProperties } from "vue-css-definition";

export interface SplitterEventArgs {
  pagePosition: number;
}

export interface SplitterEvents {
  onDragstart: SplitterEventArgs;
  onDragmove: SplitterEventArgs;
  onDragend: SplitterEventArgs;
}

export default tsx.componentFactoryOf<SplitterEvents>().create(
  // @vue/component
  {
    name: "VSplitter",
    // prettier-ignore
    props: {
      direction: p.ofStringLiterals("horizontal", "vertical").required,
      thickness: p(Number).validator(v => v > 0).default(3)
    },
    data() {
      return {
        dragging: false
      };
    },
    computed: {
      classes(): object {
        const { direction, dragging } = this;
        return {
          [style[direction]]: true,
          [style.dragging]: dragging
        };
      },
      dynamicStyle(): CssProperties {
        const thickness = px(this.thickness);
        if (this.direction === "horizontal") {
          return {
            flexBasis: thickness,
            width: thickness
          };
        } else {
          return {
            flexBasis: thickness,
            height: thickness
          };
        }
      }
    },
    methods: {
      emitEvent(eventName: string, e: MouseEvent) {
        let args: SplitterEventArgs;
        if (this.direction === "horizontal") {
          args = { pagePosition: e.pageX - this.thickness / 2 };
        } else {
          args = { pagePosition: e.pageY - this.thickness / 2 };
        }
        this.$emit(eventName, args);
      },
      onSplitterMouseDown(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        this.dragging = true;
        this.emitEvent("dragstart", event);
        const onMouseMove = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          this.emitEvent("dragmove", e);
        };
        const onMouseUp = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          this.dragging = false;
          this.emitEvent("dragmove", e);
          this.emitEvent("dragend", e);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }
    },
    render(): VNode {
      return (
        <div
          class={this.classes}
          style={this.dynamicStyle}
          onMousedown={this.onSplitterMouseDown}
        />
      );
    }
  },
  ["direction"]
);

const style = css`
  .splitter {
    flex-grow: 0;
    flex-shrink: 0;
    box-sizing: border-box;
    &:hover {
      background-color: #383838;
    }
  }

  .${"horizontal"} {
    @extend .splitter;
    cursor: col-resize;
    margin: 0 1px;
  }

  .${"vertical"} {
    @extend .splitter;
    cursor: row-resize;
    margin: 1px 0;
  }

  .${"dragging"} {
    background-color: #383838;
  }
`;
