import { createContext, useEffect, useMemo, useState } from "react";

export interface PartialStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface PersistStateMethods {
  useState<T>(key: string, initialValue: T): [T, (newValue: T) => void];
}

export const PersistStateContext = createContext<PersistStateMethods>({
  useState: (_, initialValue) => useState(initialValue)
});

export const PersistStateProvider: React.FC<
  React.PropsWithChildren<{ storage: PartialStorage; prefix?: string }>
> = ({ storage, prefix, children }) => {
  const handler: PersistStateMethods = useMemo(
    () => ({
      useState<T>(key: string, initialValue: T) {
        const realKey = prefix ? prefix + key : key;
        const valueFromStorage = storage.getItem(realKey);
        let defaultValue = initialValue;
        if (valueFromStorage) {
          try {
            defaultValue = JSON.parse(valueFromStorage) as T;
          } catch (_e) {
            console.warn("[PersistStateProvider] Failed to parse storaged value");
          }
        }
        const [value, setValue] = useState(defaultValue);
        useEffect(() => {
          storage.setItem(realKey, JSON.stringify(value));
        }, [realKey, value]);
        return [value, setValue];
      }
    }),
    [storage, prefix]
  );
  return <PersistStateContext.Provider value={handler}>{children}</PersistStateContext.Provider>;
};
