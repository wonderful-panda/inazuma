import * as vca from "vue-tsx-support/lib/vca";
import VIconButton from "./VIconButton";
import { css } from "emotion";
import { ref } from "@vue/composition-api";
import { required, withDefault } from "./prop";
import { SplitterDirection } from "view/mainTypes";

export interface SplitterEventArgs {
  pagePosition: number;
}

export interface SplitterEvents {
  onDragstart: SplitterEventArgs;
  onDragmove: SplitterEventArgs;
  onDragend: SplitterEventArgs;
}

const HOVER_COLOR = "#383838";

export default vca.component({
  name: "VSplitter",
  // prettier-ignore
  props: {
    direction: required<SplitterDirection>(String),
    thickness: withDefault(Number, 3),
    allowDirectionChange: required(Boolean)
  },
  setup(p, ctx: vca.SetupContext<SplitterEvents>) {
    const updater = vca.updateEmitter<typeof p>();
    const dragging = ref(false);
    const emitEvent = (eventName: keyof SplitterEvents, e: MouseEvent) => {
      let args: SplitterEventArgs;
      if (p.direction === "horizontal") {
        args = { pagePosition: e.pageX - p.thickness / 2 };
      } else {
        args = { pagePosition: e.pageY - p.thickness / 2 };
      }
      vca.emitOn(ctx, eventName, args);
    };
    const onSplitterMouseDown = (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      dragging.value = true;
      emitEvent("onDragstart", event);
      const onMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        emitEvent("onDragmove", e);
      };

      const onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        dragging.value = false;
        emitEvent("onDragmove", e);
        emitEvent("onDragend", e);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const toggleDirection = () => {
      const value = p.direction === "horizontal" ? "vertical" : "horizontal";
      updater(ctx, "direction", value);
    };

    return () => (
      <div
        class={style.splitter(
          p.direction === "horizontal",
          p.thickness,
          dragging.value
        )}
        onMousedown={onSplitterMouseDown}
      >
        {p.allowDirectionChange ? (
          <VIconButton
            raised
            tooltip="Switch splitter orientation"
            action={toggleDirection}
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
