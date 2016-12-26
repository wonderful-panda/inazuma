import * as typed from "vue-typed-component";
import { px, clamp } from "../utils";
import { CssProperties } from "vue-css-definition";
import { PropOptions } from "./propOptions";

export interface SplitterPanelProps {
    direction: "horizontal" | "vertical";
    splitterWidth: number;
    initialRatio: number;
    minSizeFirst: any;
    minSizeSecond: any;
}

interface SplitterPanelData {
    flexFirst: number;
    dragging: boolean;
}

const FLEX_SUM = 1000;

@typed.component<SplitterPanelProps, SplitterPanel>({
    ...<CompiledTemplate>require("./splitterPanel.pug"),
    props: {
        direction: PropOptions.stringRequired(),
        splitterWidth: PropOptions.numberDefault(3, v => v >= 1),
        initialRatio: PropOptions.numberDefault(0.5, v => 0 <= v && v <= 1),
        minSizeFirst: PropOptions.default_("10%"),
        minSizeSecond: PropOptions.default_("10%")
    }
})
export class SplitterPanel extends typed.StatefulTypedComponent<SplitterPanelProps, SplitterPanelData> {
    data(): SplitterPanelData {
        return { flexFirst: Math.floor(FLEX_SUM * this.$props.initialRatio), dragging: false };
    }

    get horizontal() {
        return this.$props.direction === "horizontal";
    }

    get splitterClass() {
        return {
            "splitter-panel-splitter-horizontal": this.horizontal,
            "splitter-panel-splitter-vertical": !this.horizontal,
            "splitter-panel-splitter-dragging": this.$data.dragging
        };
    }

    get containerStyle(): CssProperties {
        return {
            display: "flex",
            flexDirection: this.horizontal ? "row" : "column",
            flexWrap: "nowrap",
            alignItems: "stretch",
            overflow: "hidden"
        };
    }

    get firstPanelStyle(): CssProperties {
        return this.setMinSize({
            display: "flex",
            flex: this.$data.flexFirst,
            overflow: "auto"
        }, this.$props.minSizeFirst);
    }

    get secondPanelStyle(): CssProperties {
        return this.setMinSize({
            display: "flex",
            flex: FLEX_SUM - this.$data.flexFirst,
            overflow: "auto"
        }, this.$props.minSizeSecond);
    }

    setMinSize(cssprops: CssProperties, value: any): CssProperties {
        if (this.horizontal) {
            cssprops.minWidth = value;
        }
        else {
            cssprops.minHeight = value;
        }
        return cssprops;
    }

    get splitterStyle(): CssProperties {
        return {
            flexBasis: px(this.$props.splitterWidth),
            flexGrow: 0,
            flexShrink: 0,
            cursor: this.horizontal ? "col-resize" : "row-resize"
        };
    }

    onSplitterMouseDown(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        const el = this.$el;
        const b = el.getBoundingClientRect();
        const basePosition = this.horizontal ? b.left + el.clientLeft : b.top + el.clientTop;
        const totalLength = this.horizontal ? el.clientWidth : el.clientHeight;
        this.$data.dragging = true;
        const onMouseMove = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const currentOffset = (this.horizontal ? e.clientX : e.clientY) - basePosition;
            const flexFirst = Math.floor(clamp(currentOffset / totalLength, 0, 1) * FLEX_SUM);
            this.$data.flexFirst = flexFirst;
        }
        const onMouseUp = () => {
            this.$data.dragging = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }
}
