import { MdProgressSpinner } from "./md";
import { css } from "emotion";

export default _fc(() => (
  <div class={style.backdrop}>
    <MdProgressSpinner md-mode="indeterminate" class={style.spinner} />
  </div>
));

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
    z-index: 999999;
  `,
  spinner: css`
    margin: auto;
  `
};
