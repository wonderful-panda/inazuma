import { shortHash } from "view/filters";
import { MonoSpan } from "./base/mono";
import { omit } from "core/utils";

export const GitHash = _fc<{ hash: string }>(
  ({ props, data: { scopedSlots, attrs, ...rest } }) => {
    return (
      <MonoSpan title={props.hash} {...rest} attrs={omit(attrs, ["hash"])}>
        {shortHash(props.hash.substring(0, 8))}
      </MonoSpan>
    );
  }
);
