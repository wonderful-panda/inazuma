import { createContext, useMemo } from "react";

export interface PartialStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export const PersistStateContext = createContext<PartialStorage>({
  getItem: () => null,
  setItem: () => {}
});

export const PersistStateProvider: React.FC<
  React.PropsWithChildren<{ storage: PartialStorage; prefix?: string }>
> = ({ storage, prefix, children }) => {
  const prefixedStorage: PartialStorage = useMemo(
    () => ({
      getItem(key: string) {
        const realKey = prefix ? prefix + key : key;
        return storage.getItem(realKey);
      },
      setItem(key: string, value: string) {
        const realKey = prefix ? prefix + key : key;
        storage.setItem(realKey, value);
      }
    }),
    [storage, prefix]
  );
  return (
    <PersistStateContext.Provider value={prefixedStorage}>{children}</PersistStateContext.Provider>
  );
};
