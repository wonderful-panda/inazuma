import { createContext, useEffect, useMemo, useState } from "react";

export interface PartialStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface PersistStateHandler {
  useState<T>(key: string, initialValue: T): [T, (newValue: T) => void];
}

export const PersistStateContext = createContext<PersistStateHandler>({
  useState: (_, initialValue) => useState(initialValue)
});

export const PersistStateProvider: React.FC<{ storage: PartialStorage; prefix?: string }> = ({
  storage,
  prefix,
  children
}) => {
  const handler: PersistStateHandler = useMemo(
    () => ({
      useState<T>(key: string, initialValue: T) {
        const realKey = prefix ? prefix + key : key;
        const valueFromStorage = storage.getItem(realKey);
        let defaultValue = initialValue;
        if (valueFromStorage) {
          try {
            defaultValue = JSON.parse(valueFromStorage);
          } catch (e) {
            console.warn("[PersistStateProvider] Failed to parse storaged value");
          }
        }
        const [value, setValue] = useState(defaultValue);
        useEffect(() => {
          storage.setItem(realKey, JSON.stringify(value));
        }, [key, value]);
        return [value, setValue];
      }
    }),
    [storage, prefix]
  );
  return <PersistStateContext.Provider value={handler}>{children}</PersistStateContext.Provider>;
};
