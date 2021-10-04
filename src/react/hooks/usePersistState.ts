import { PersistStateContext } from "@/context/PersistStateContext";
import { useContext } from "react";

export const usePersistState = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  return useContext(PersistStateContext).useState(key, initialValue);
};
