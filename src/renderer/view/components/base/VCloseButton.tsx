import { VIconButton } from "./VIconButton";
import { VMaterialIcon } from "./VMaterialIcon";
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
        <VMaterialIcon name="Close" size={20} />
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
  `
};
