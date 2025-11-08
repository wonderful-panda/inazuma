import { useContext, useEffect, useState } from "react";
import { PersistStateContext } from "@/context/PersistStateContext";

export const usePersistState = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const { getItem, setItem } = useContext(PersistStateContext);
  const [value, setValue] = useState(() => {
    const storedValue = getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
  });

  useEffect(() => {
    setItem(key, JSON.stringify(value));
  }, [key, setItem, value]);

  return [value, setValue];
};
