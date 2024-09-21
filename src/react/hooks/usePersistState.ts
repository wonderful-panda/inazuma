import { PersistStateContext } from "@/context/PersistStateContext";
import { useContext, useEffect, useLayoutEffect, useState } from "react";

export const usePersistState = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const { getItem, setItem } = useContext(PersistStateContext);
  const [value, setValue] = useState(initialValue);
  useLayoutEffect(() => {
    const storedValue = getItem(key);
    if (storedValue) {
      setValue(JSON.parse(storedValue) as T);
    }
  }, [key, getItem]);

  useEffect(() => {
    setItem(key, JSON.stringify(value));
  }, [key, setItem, value]);

  return [value, setValue];
};
