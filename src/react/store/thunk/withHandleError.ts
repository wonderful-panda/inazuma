import { Dispatch, RootState } from "@/store";
import { REPORT_ERROR } from "@/store/misc";

type ThunkAction<R> = (dispatch: Dispatch, getState: () => RootState) => Promise<R>;
type Thunk<A extends unknown[], R> = (...args: A) => ThunkAction<R>;
type ThunkActionResult<T extends Thunk<unknown[], unknown>> = T extends Thunk<any, infer R>
  ? R
  : never;

export const withHandleError = <T extends Thunk<any[], any>>(
  thunk: T
): Thunk<Parameters<T>, ThunkActionResult<T> | "failed"> => {
  return (...args: Parameters<T>) => {
    return (dispatch: Dispatch, getState: () => RootState) => {
      return thunk(...args)(dispatch, getState).catch((error) => {
        dispatch(REPORT_ERROR({ error }));
        return "failed" as const;
      });
    };
  };
};
