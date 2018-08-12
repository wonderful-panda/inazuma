import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { px } from "core/utils";
import { CssProperties } from "vue-css-definition";
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

// @vue/component
export default tsx.componentFactoryOf<SplitterEvents>().create({
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
        class={style.spliitter(this.direction === "horizontal", this.dragging)}
        style={this.dynamicStyle}
        onMousedown={this.onSplitterMouseDown}
      />
    );
  }
});

const style = {
  spliitter: (horizontal: boolean, dragging: boolean) => css`
    flex-grow: 0;
    flex-shrink: 0;
    box-sizing: border-box;
    &:hover {
      background-color: #383838;
    }
    cursor: ${horizontal ? "col-resize" : "row-resize"};
    margin: ${horizontal ? "0 1px" : "1px 0"};
    background-color: ${dragging ? "#383838" : undefined};
  `
};
