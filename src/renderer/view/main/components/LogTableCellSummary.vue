<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import LogTableCellSummaryRef from "./LogTableCellSummaryRef.vue";

// @vue/component
export default tsx.component({
  name: "LogTableCellSummary",
  props: {
    commit: p.ofObject<Commit>().required,
    refs: p.ofRoArray<Ref>().required
  },
  render(): VNode {
    return (
      <transition-group
        tag="div"
        style={{ display: "flex", flexFlow: "row nowrap" }}
      >
        {this.refs.map(r => (
          <LogTableCellSummaryRef key={r.fullname} refObject={r} />
        ))}
        <span key="summary">{this.commit.summary}</span>)
      </transition-group>
    );
  }
});
</script>
