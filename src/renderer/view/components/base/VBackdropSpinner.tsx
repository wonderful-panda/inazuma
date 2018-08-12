import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { MdProgressSpinner } from "./md";
import * as emotion from "emotion";
const css = emotion.css;

export default tsx.component({
  name: "VBackdropSpinner",
  functional: true,
  render(): VNode {
    return (
      <div class={style.backdrop}>
        <MdProgressSpinner md-mode="indeterminate" class={style.spinner} />
      </div>
    );
  }
});

const style = {
  backdrop: css`
    position: absolute;
    flex: 1;
    display: flex;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
  `,
  spinner: css`
    margin: auto;
  `
};
