import { Atom, createStore } from "jotai";
export type Store = ReturnType<typeof createStore>;

export function createWacher<T>(atom: Atom<T>, store: Store) {
  return (handler: (value: T) => void) =>
    store.sub(atom, () => {
      const value = store.get(atom);
      handler(value);
    });
}
