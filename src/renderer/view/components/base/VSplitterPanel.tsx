import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import { clamp } from "core/utils";
import { CssProperties } from "vue-css-definition";
import VSplitter, { SplitterEventArgs } from "./VSplitter";
import { __sync } from "view/utils/modifiers";
import { ref, computed } from "@vue/composition-api";

const FLEX_SUM = 1000;

export default vca.component({
  name: "VSplitterPanel",
  props: {
    direction: p.ofStringLiterals("horizontal", "vertical").required,
    splitterWidth: p(Number).validator(v => v > 0).required,
    ratio: p(Number).validator(v => 0 <= v && v <= 1).required,
    minSizeFirst: p(String, Number).default("10%"),
    minSizeSecond: p(String, Number).default("10%"),
    showFirst: p(Boolean).default(true),
    showSecond: p(Boolean).default(true),
    allowDirectionChange: p(Boolean).default(false)
  },
  setup(p, ctx) {
    const flexFirst = computed(() => Math.floor(FLEX_SUM * p.ratio));
    const flexSecond = computed(() => FLEX_SUM - flexFirst.value);
    const containerStyle = computed(
      () =>
        ({
          display: "flex",
          flexDirection: p.direction === "horizontal" ? "row" : "column",
          flexWrap: "nowrap",
          alignItems: "stretch",
          overflow: "hidden"
        } as CssProperties)
    );
    const firstPanelStyle = computed(() => ({
      display: "flex",
      flex: flexFirst.value,
      flexDirection: p.direction === "horizontal" ? "column" : "row",
      alignItems: "stretch",
      overflow: "auto",
      minWidth: p.direction === "horizontal" ? p.minSizeFirst : undefined,
      minHeight: p.direction === "horizontal" ? undefined : p.minSizeFirst
    }));
    const secondPanelStyle = computed(() => ({
      display: "flex",
      flex: flexSecond.value,
      flexDirection: p.direction === "horizontal" ? "column" : "row",
      alignItems: "stretch",
      overflow: "auto",
      minWidth: p.direction === "horizontal" ? p.minSizeSecond : undefined,
      minHeight: p.direction === "horizontal" ? undefined : p.minSizeSecond
    }));

    const first = ref(null as HTMLDivElement | null);
    const second = ref(null as HTMLDivElement | null);

    const update = vca.updateEmitter<typeof p>();
    const onSplitterMove = ({ pagePosition }: SplitterEventArgs) => {
      if (!first.value || !second.value) {
        return;
      }
      const docBound = document.body.getBoundingClientRect();
      const firstBound = first.value.getBoundingClientRect();
      let newRatio: number;
      if (p.direction === "horizontal") {
        const firstClientWidth = first.value.clientWidth;
        const sum = firstClientWidth + second.value.clientWidth;
        const newFirstClientWidth =
          pagePosition -
          (firstBound.left - docBound.left) /* pageX of first panel */ -
          (firstBound.width - firstClientWidth); /* maybe scrollbar width */
        newRatio = newFirstClientWidth / sum;
      } else {
        const firstClientHeight = first.value.clientHeight;
        const sum = firstClientHeight + second.value.clientHeight;
        const newFirstClientHeight =
          pagePosition -
          (firstBound.top - docBound.top) /* pageY of first panel */ -
          (firstBound.height - firstClientHeight); /* maybe scrollbar height */
        newRatio = newFirstClientHeight / sum;
      }
      update(ctx, "ratio", clamp(newRatio, 0, 1));
    };

    return () => (
      <div class="splitter-panel-container" style={containerStyle.value}>
        <div
          ref={first as any}
          v-show={p.showFirst}
          class="splitter-panel-first"
          style={firstPanelStyle.value}
        >
          {ctx.slots.first()}
        </div>
        <VSplitter
          v-show={p.showFirst && p.showSecond}
          direction={__sync(p.direction, v => update(ctx, "direction", v))}
          thickness={p.splitterWidth}
          onDragmove={onSplitterMove}
          allowDirectionChange={p.allowDirectionChange}
        />
        <div
          ref={second as any}
          v-show={p.showSecond}
          class="splitter-panel-second"
          style={secondPanelStyle.value}
        >
          {ctx.slots.second()}
        </div>
      </div>
    );
  }
});
