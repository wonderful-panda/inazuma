import { Dispatch, RootState } from "@/store";

export type ThunkAction<R> = (dispatch: Dispatch, getState: () => RootState) => Promise<R>;
export type Thunk<A extends unknown[], R> = (...args: A) => ThunkAction<R>;
export type ThunkActionResult<T extends Thunk<unknown[], unknown>> = T extends Thunk<any, infer R>
  ? R
  : never;
