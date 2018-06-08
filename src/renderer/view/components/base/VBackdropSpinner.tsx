import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import * as md from "view/utils/md-classes";
import * as style from "./VBackdropSpinner.scss";

export default tsx.component({
  name: "VBackdropSpinner",
  functional: true,
  props: {
    accent: p(Boolean).default(false)
  },
  render(_h, { props }): VNode {
    return (
      <div class={style.backdrop}>
        <md-progress-spinner
          md-mode="indeterminate"
          class={{ [style.spinner]: true, [md.ACCENT]: props.accent }}
        />
      </div>
    );
  }
});
