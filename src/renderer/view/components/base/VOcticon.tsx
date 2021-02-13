import { paths } from "./__octicon";
import { omit } from "core/utils";
import { css } from "@emotion/css";
import { withclass } from "./withClass";

export type OcticonNames = keyof typeof paths;

const OcticonSvg = withclass.svg(css`
  width: 24px;
  height: 24px;
  padding: 2px;
`);

export const VOcticon = _fc<{
  name: OcticonNames;
  color: string;
  title?: string;
}>(({ props, data }) => {
  const { scopedSlots, attrs, ...rest } = data;
  return (
    <OcticonSvg fill={props.color} {...rest} attrs={omit(attrs, Object.keys(props))}>
      {props.title && <title>{props.title}</title>}
      {paths[props.name]()}
    </OcticonSvg>
  );
});
