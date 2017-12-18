<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { px, clamp } from "core/utils";
import { CssProperties } from "vue-css-definition";

const FLEX_SUM = 1000;

export default tsx.component(
  // @vue/component
  {
    name: "VSplitterPanel",
    props: {
      direction: p.ofStringLiterals("horizontal", "vertical").required,
      splitterWidth: p(Number)
        .validator(v => v > 0)
        .default(3),
      initialRatio: p(Number)
        .validator(v => 0 <= v && v <= 1)
        .default(0.5),
      minSizeFirst: p(String, Number).default("10%"),
      minSizeSecond: p(String, Number).default("10%")
    },
    data() {
      return {
        flexFirst: Math.floor(FLEX_SUM * this.initialRatio),
        dragging: false
      };
    },
    computed: {
      horizontal(): boolean {
        return this.direction === "horizontal";
      },
      splitterClass(): object {
        return {
          "splitter-panel-splitter-horizontal": this.horizontal,
          "splitter-panel-splitter-vertical": !this.horizontal,
          "splitter-panel-splitter-dragging": this.$data.dragging
        };
      },
      containerStyle(): CssProperties {
        return {
          display: "flex",
          flexDirection: this.horizontal ? "row" : "column",
          flexWrap: "nowrap",
          alignItems: "stretch",
          overflow: "hidden"
        };
      },
      firstPanelStyle(): CssProperties {
        return this.setMinSize(
          {
            display: "flex",
            flex: this.flexFirst,
            flexDirection: this.horizontal ? "column" : "row",
            alignItems: "stretch",
            overflow: "auto"
          },
          this.minSizeFirst
        );
      },
      secondPanelStyle(): CssProperties {
        return this.setMinSize(
          {
            display: "flex",
            flex: FLEX_SUM - this.$data.flexFirst,
            flexDirection: this.horizontal ? "column" : "row",
            alignItems: "stretch",
            overflow: "auto"
          },
          this.minSizeSecond
        );
      },
      splitterStyle(): CssProperties {
        return {
          flexBasis: px(this.splitterWidth),
          flexGrow: 0,
          flexShrink: 0,
          cursor: this.horizontal ? "col-resize" : "row-resize"
        };
      }
    },
    methods: {
      setMinSize(cssprops: CssProperties, value: any): CssProperties {
        if (this.horizontal) {
          cssprops.minWidth = value;
        } else {
          cssprops.minHeight = value;
        }
        return cssprops;
      },
      onSplitterMouseDown(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        const el = this.$el;
        const b = el.getBoundingClientRect();
        const basePosition = this.horizontal
          ? b.left + el.clientLeft
          : b.top + el.clientTop;
        const totalLength = this.horizontal ? el.clientWidth : el.clientHeight;
        this.$data.dragging = true;
        const onMouseMove = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          const currentOffset =
            (this.horizontal ? e.clientX : e.clientY) - basePosition;
          const flexFirst = Math.floor(
            clamp(currentOffset / totalLength, 0, 1) * FLEX_SUM
          );
          this.$data.flexFirst = flexFirst;
        };
        const onMouseUp = () => {
          this.$data.dragging = false;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      }
    },
    render(): VNode {
      const { first, second } = this.$slots;
      return (
        <div class="splitter-panel-container" style={this.containerStyle}>
          <div class="splitter-panel-first" style={this.firstPanelStyle}>
            {first}
          </div>
          <div
            class={this.splitterClass}
            style={this.splitterStyle}
            onMousedown={this.onSplitterMouseDown}
          />
          <div class="splitter-panel-second" style={this.secondPanelStyle}>
            {second}
          </div>
        </div>
      );
    }
  },
  ["direction"]
);
</script>

<style lang="scss">
.splitter-panel-splitter-horizontal,
.splitter-panel-splitter-vertical {
  margin: 0 2px;
  &:hover {
    background-color: #383838;
  }
}
</style>
