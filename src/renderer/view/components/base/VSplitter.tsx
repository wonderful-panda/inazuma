import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VIconButton from "./VIconButton";
import * as emotion from "emotion";
const css = emotion.css;

export interface SplitterEventArgs {
  pagePosition: number;
}

export interface SplitterEvents {
  onDragstart: SplitterEventArgs;
  onDragmove: SplitterEventArgs;
  onDragend: SplitterEventArgs;
}

const HOVER_COLOR = "#383838";

// @vue/component
export default tsx.componentFactoryOf<SplitterEvents>().create({
  name: "VSplitter",
  // prettier-ignore
  props: {
      direction: p.ofStringLiterals("horizontal", "vertical").required,
      thickness: p(Number).validator(v => v > 0).default(3),
      allowDirectionChange: p(Boolean).required
    },
  data() {
    return {
      dragging: false
    };
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
    },
    changeDirection() {
      this.$emit(
        "update:direction",
        this.direction === "horizontal" ? "vertical" : "horizontal"
      );
    }
  },
  render(): VNode {
    const { direction, thickness, dragging } = this;
    return (
      <div
        class={style.splitter(direction === "horizontal", thickness, dragging)}
        onMousedown={this.onSplitterMouseDown}
      >
        {this.allowDirectionChange ? (
          <VIconButton
            raised
            tooltip="Switch splitter orientation"
            action={this.changeDirection}
          >
            swap_horiz
          </VIconButton>
        ) : (
          undefined
        )}
      </div>
    );
  }
});

const style = {
  splitter: (horizontal: boolean, thickness: number, dragging: boolean) => css`
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: ${thickness}px;
    box-sizing: border-box;
    position: relative;
    cursor: ${horizontal ? "col-resize" : "row-resize"};
    margin: ${horizontal ? "0 1px" : "1px 0"};
    background-color: ${dragging ? HOVER_COLOR : undefined};
    .md-icon-button {
      visibility: ${dragging ? "visible" : "hidden"};
      position: absolute;
      transition: transform 0.2s ease;
      left: -20px;
      right: -20px;
      top: -20px;
      bottom: -20px;
      margin: auto;
      padding: auto;
      margin: auto;
      background-color: ${HOVER_COLOR} !important;
      transform: rotate(${horizontal ? 0 : 90}deg);
      &:hover {
        transform: rotate(${horizontal ? 90 : 0}deg);
      }
    }
    &:hover {
      background-color: ${HOVER_COLOR} !important;
      .md-icon-button {
        visibility: visible;
      }
    }
  `
};
