import { useCallback, useContext, useRef, useSyncExternalStore } from "react";
import { PersistStateContext } from "@/context/PersistStateContext";

export const usePersistState = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const store = useContext(PersistStateContext);
  const lastValueRef = useRef<{ rawValue: string | null; parsedValue: T } | undefined>(undefined);
  const getSnapshot = useCallback((): T => {
    const rawValue = store.getItem(key);
    if (lastValueRef.current?.rawValue === rawValue) {
      return lastValueRef.current.parsedValue;
    } else {
      const parsedValue = rawValue ? (JSON.parse(rawValue) as T) : initialValue;
      lastValueRef.current = { rawValue, parsedValue };
      return parsedValue;
    }
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
