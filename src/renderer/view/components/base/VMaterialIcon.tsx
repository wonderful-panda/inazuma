import { paths } from "./__mdi";
import { omit } from "core/utils";
import { css } from "@emotion/css";

export type MaterialIconNames = keyof typeof paths;

const className = css`
  vertical-align: bottom;
`;

export const VMaterialIcon = _fc<{
  name: MaterialIconNames;
  size?: number;
}>(({ props, data }) => {
  const { scopedSlots, attrs, ...rest } = data;
  const size = props.size || 24;
  return (
    <svg
      viewBox="0 0 24 24"
      {...rest}
      fill="currentColor"
      width={size}
      height={size}
      class={className}
      attrs={omit(attrs, Object.keys(props))}
    >
      <path d={paths[props.name]} />
    </svg>
  );
});
