import { paths } from "./octicon-paths";
import { omit } from "core/utils";

export type IconNames = keyof typeof paths;

export const Octicon = _fc<{
  name: IconNames;
  color: string;
  size?: 16 | 24 | 32;
}>(({ props, data }) => {
  const { scopedSlots, attrs, ...rest } = data;
  const size = props.size || 24;
  const padding = (size - 16) / 2;
  return (
    <svg
      width={size}
      height={size}
      style={`fill:${props.color}; padding:${padding}px;`}
      {...rest}
      attrs={omit(attrs, ["name", "color", "size"])}
    >
      {paths[props.name]()}
    </svg>
  );
});
