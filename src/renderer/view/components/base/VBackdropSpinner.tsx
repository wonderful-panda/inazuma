import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import * as md from "view/utils/md-classes";

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

const style = css`
  .${"backdrop"} {
    position: absolute;
    flex: 1;
    display: flex;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .${"spinner"} {
    margin: auto;
  }
`;
