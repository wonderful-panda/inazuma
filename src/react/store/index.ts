import { configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch as useDispatch_,
  useSelector as useSelector_
} from "react-redux";
import repositoryReducer from "./repository";
import miscReducer from "./misc";
import confirmDialogReducer from "./confirmDialog";

const store = configureStore({
  reducer: {
    repository: repositoryReducer,
    misc: miscReducer,
    confirmDialog: confirmDialogReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
export const useSelector: TypedUseSelectorHook<RootState> = useSelector_;
export const useDispatch: () => Dispatch = useDispatch_;

export interface Watcher<T> {
  selector: (state: RootState) => T;
  handler: (value: T, oldValue: T) => void;
}

const watchers: Array<(state: RootState) => void> = [];

export const watch = <T>(
  selector: (state: RootState) => T,
  handler: (value: T, oldValue: T | undefined) => void
): (() => void) => {
  let value = selector(store.getState());
  const watcher = (state: RootState) => {
    const oldValue = value;
    try {
      value = selector(state);
      if (value !== oldValue) {
        handler(value, oldValue);
      }
    } catch (e) {
      console.error(`Error occured in watch handler: ${e}`);
    }
  };
  watchers.push(watcher);
  const unwatch = () => {
    const index = watchers.indexOf(watcher);
    if (0 <= index) {
      watchers.splice(index, 1);
    }
  };
  return unwatch;
};

store.subscribe(() => {
  const state = store.getState();
  for (const subscriber of watchers) {
    subscriber(state);
  }
});

export default store;
