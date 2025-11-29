import { useCallback, useContext, useSyncExternalStore } from "react";
import { PersistStateContext } from "@/context/PersistStateContext";

export const usePersistState = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const store = useContext(PersistStateContext);
  const getSnapshot = useCallback(() => {
    const storedValue = store.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
  }, [store.getItem, key, initialValue]);

  const subscribe = useCallback(
    (callback: () => void) => {
      store.subscribe(key, callback);
      return () => store.unsubscribe(key, callback);
    },
    [key, store.subscribe, store.unsubscribe]
  );
  const value = useSyncExternalStore(subscribe, getSnapshot);
  const setValue = useCallback(
    (value: T) => store.setItem(key, JSON.stringify(value)),
    [key, store.setItem]
  );
  return [value, setValue];
};
