import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import LogTableCellSummaryRef from "./LogTableCellSummaryRef";
import { CssProperties } from "vue-css-definition";

// @vue/component
export default tsx.component({
  name: "LogTableCellSummary",
  props: {
    commit: p.ofObject<Commit>().required,
    refs: p.ofRoArray<Ref>().required
  },
  computed: {
    style(): CssProperties {
      return {
        display: "flex",
        flexFlow: "row nowrap",
        alignItems: "baseline"
      };
    }
  },
  render(): VNode {
    return (
      <div style={this.style}>
        {this.refs.map(r => (
          <LogTableCellSummaryRef key={r.fullname} refObject={r} />
        ))}
        <span key="summary">{this.commit.summary}</span>
      </div>
    );
  }
});
