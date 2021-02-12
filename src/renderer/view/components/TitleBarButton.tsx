import { VIconButton } from "./base/VIconButton";
import { css } from "@emotion/css";
import { MaterialIconNames, VMaterialIcon } from "./base/VMaterialIcon";
import { ComponentProps } from "vue-tsx-support/lib/advance";
import { omit } from "core/utils";

const style = {
  button: css`
    min-height: 28px;
    max-height: 28px;
    min-width: 28px;
    max-width: 28px;
  `,
  icon: css`
    color: #888;
    &:hover {
      color: #fff;
    }
  `
};

export const TitleBarButton = _fc<ComponentProps<typeof VIconButton> & { name: MaterialIconNames }>(
  ({ props, data }) => {
    const { props: _, scopedSlots, ...rest } = data;
    return (
      <VIconButton class={style.button} {...omit(props, ["name"])} {...rest}>
        <VMaterialIcon class={style.icon} name={props.name} />
      </VIconButton>
    );
  }
);
