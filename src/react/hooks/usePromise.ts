import { useLayoutEffect, useState } from "react";

export const usePromise = <T>(promise: Promise<T>, defaultValue: T) => {
  const [value, setValue] = useState(defaultValue);
  useLayoutEffect(() => {
    setValue(defaultValue);
    promise.then((value) => setValue(value));
  }, [promise, defaultValue]);
  return value;
};
