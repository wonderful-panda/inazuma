import { createContext } from "react";
import type { StateStorage } from "@/stateStorage";

export interface PartialStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  subscribe: (key: string, listener: () => void) => void;
  unsubscribe: (key: string, listener: () => void) => void;
}

export const PersistStateContext = createContext<PartialStorage>({
  getItem: () => null,
  setItem: () => {},
  subscribe: () => {},
  unsubscribe: () => {}
});

export const PersistStateProvider: React.FC<React.PropsWithChildren<{ storage: StateStorage }>> = ({
  storage,
  children
}) => {
  return <PersistStateContext.Provider value={storage}>{children}</PersistStateContext.Provider>;
};
