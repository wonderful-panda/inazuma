import type { TsArg } from "./TsArg";
import type { TsType } from "./TsType";

export interface TsFunc {
  name: string;
  args: Array<TsArg>;
  ret: TsType;
}
