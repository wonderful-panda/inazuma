import VIconButton from "./VIconButton";
import { css } from "@emotion/css";

// @vue/component
export default _fc<{ disabled?: boolean; action: () => void }>(
  ({ props, data: { scopedSlots, ...rest } }) => {
    return (
      <VIconButton
        class={style.closeButton}
        disabled={props.disabled}
        action={props.action}
        {...rest}
      >
        close
      </VIconButton>
    );
  }
);

const style = {
  closeButton: css`
    min-width: 32px;
    min-height: 32px;
    margin: 0;
    padding: auto;
    .md-icon {
      font-size: 20px !important;
    }
  `
};
