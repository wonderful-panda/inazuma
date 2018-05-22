import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { clamp } from "core/utils";
import { CssProperties } from "vue-css-definition";
import VSplitter, { SplitterEventArgs } from "./VSplitter";

const FLEX_SUM = 1000;

export default tsx.component(
  // @vue/component
  {
    name: "VSplitterPanel",
    props: {
      direction: p.ofStringLiterals("horizontal", "vertical").required,
      splitterWidth: p(Number).validator(v => v > 0).required,
      ratio: p(Number).validator(v => 0 <= v && v <= 1).required,
      minSizeFirst: p(String, Number).default("10%"),
      minSizeSecond: p(String, Number).default("10%")
    },
    data() {
      return {
        dragging: false
      };
    },
    computed: {
      flexFirst(): number {
        return Math.floor(FLEX_SUM * this.ratio);
      },
      flexSecond(): number {
        return FLEX_SUM - this.flexFirst;
      },
      horizontal(): boolean {
        return this.direction === "horizontal";
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
        const horizontal = this.horizontal;
        return {
          display: "flex",
          flex: this.flexFirst,
          flexDirection: horizontal ? "column" : "row",
          alignItems: "stretch",
          overflow: "auto",
          minWidth: horizontal ? this.minSizeFirst : undefined,
          minHeight: horizontal ? undefined : this.minSizeFirst
        };
      },
      secondPanelStyle(): CssProperties {
        const horizontal = this.horizontal;
        return {
          display: "flex",
          flex: this.flexSecond,
          flexDirection: horizontal ? "column" : "row",
          alignItems: "stretch",
          overflow: "auto",
          minWidth: horizontal ? this.minSizeSecond : undefined,
          minHeight: horizontal ? undefined : this.minSizeSecond
        };
      }
    },
    methods: {
      onSplitterMove({ pagePosition }: SplitterEventArgs) {
        const docBound = document.body.getBoundingClientRect();
        const first = this.$refs.first as HTMLDivElement;
        const second = this.$refs.second as HTMLDivElement;
        const firstBound = first.getBoundingClientRect();
        let newRatio: number;
        if (this.horizontal) {
          const firstClientWidth = first.clientWidth;
          const sum = firstClientWidth + second.clientWidth;
          const newFirstClientWidth =
            pagePosition -
            (firstBound.left - docBound.left) /* pageX of first panel */ -
            (firstBound.width - firstClientWidth); /* maybe scrollbar width */
          newRatio = newFirstClientWidth / sum;
        } else {
          const firstClientHeight = first.clientHeight;
          const sum = firstClientHeight + second.clientHeight;
          const newFirstClientHeight =
            pagePosition -
            (firstBound.top - docBound.top) /* pageY of first panel */ -
            (firstBound.height -
              firstClientHeight); /* maybe scrollbar height */
          newRatio = newFirstClientHeight / sum;
        }
        this.$emit("update:ratio", clamp(newRatio, 0, 1));
      }
    },
    render(): VNode {
      const { first, second } = this.$slots;
      return (
        <div class="splitter-panel-container" style={this.containerStyle}>
          <div
            ref="first"
            class="splitter-panel-first"
            style={this.firstPanelStyle}
          >
            {first}
          </div>
          <VSplitter
            direction={this.direction}
            thickness={this.splitterWidth}
            onDragmove={this.onSplitterMove}
          />
          <div
            ref="second"
            class="splitter-panel-second"
            style={this.secondPanelStyle}
          >
            {second}
          </div>
        </div>
      );
    }
  },
  ["direction", "splitterWidth", "ratio"]
);
