import { debounce } from "lodash";
import { invokeTauriCommand } from "./invokeTauriCommand";

const saveState = debounce((newState: Record<string, string>) => {
  invokeTauriCommand("store_state", { newState }).catch((e) => {
    console.warn("Failed to store display state:", e);
  });
}, 1000);

export interface StateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  subscribe(key: string, listener: () => void): void;
  unsubscribe(key: string, listener: () => void): void;
}

export const createStateStorage = (
  prefix: string,
  initialState: Record<string, string | undefined>
): StateStorage => {
  const state = Object.entries(initialState).reduce(
    (obj, [k, v]) => {
      if (v) obj[k] = v;
      return obj;
    },
    {} as Record<string, string>
  );
  const listeners = {} as Record<string, Set<() => void>>;
  const getItem = (key: string) => state[prefix + key] ?? null;
  const setItem = (key: string, value: string) => {
    if (state[prefix + key] !== value) {
      state[prefix + key] = value;
      listeners[key]?.forEach((listener) => void listener());
      saveState(state);
    }
  };
  const subscribe = (key: string, listener: () => void) => {
    if (listeners[key] === undefined) {
      listeners[key] = new Set([listener]);
    } else {
      listeners[key].add(listener);
    }
  };
  const unsubscribe = (key: string, listener: () => void) => {
    const listnersOfKey = listeners[key];
    if (listnersOfKey === undefined) {
      return;
    }
    listnersOfKey.delete(listener);
    if (listnersOfKey.size === 0) {
      delete listeners[key];
    }
  };
  return {
    getItem,
    setItem,
    subscribe,
    unsubscribe
  };
};
