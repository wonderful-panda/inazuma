import { Dispatch, RootState } from "@/store";
import { HIDE_LOADING, SHOW_LOADING } from "../misc";
import { Thunk, ThunkActionResult } from "./types";

export const withLoading = <T extends Thunk<any[], any>>(
  thunk: T
): Thunk<Parameters<T>, ThunkActionResult<T> | "failed"> => {
  return (...args: Parameters<T>) => {
    return async (dispatch: Dispatch, getState: () => RootState) => {
      dispatch(SHOW_LOADING());
      try {
        return await thunk(...args)(dispatch, getState);
      } finally {
        dispatch(HIDE_LOADING());
      }
    };
  };
};
