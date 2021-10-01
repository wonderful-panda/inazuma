import { configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch as useDispatch_,
  useSelector as useSelector_
} from "react-redux";
import configReducer from "./config";
import repositoryReducer from "./repository";

const store = configureStore({
  reducer: {
    repository: repositoryReducer,
    config: configReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export const useSelector: TypedUseSelectorHook<RootState> = useSelector_;
export const useDispatch: () => typeof store.dispatch = useDispatch_;

export interface Watcher<T> {
  selector: (state: RootState) => T;
  handler: (value: T, oldValue: T) => void;
}

const watchers: Array<(state: RootState) => void> = [];

export function watch<T>(
  selector: (state: RootState) => T,
  handler: (value: T, oldValue: T | undefined) => void
): () => void {
  let value = selector(store.getState());
  const watcher = (state: RootState) => {
    let oldValue = value;
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
      delete watchers[index];
    }
  };
  return unwatch;
}

store.subscribe(() => {
  const state = store.getState();
  for (const subscriber of watchers) {
    subscriber(state);
  }
});

export default store;