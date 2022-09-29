import { Dispatch, RootState } from "@/store";
import { REPORT_ERROR } from "@/store/misc";
import { Thunk, ThunkActionResult } from "./types";

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
