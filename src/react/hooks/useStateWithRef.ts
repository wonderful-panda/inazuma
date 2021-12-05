import { useLayoutEffect, useRef, useState } from "react";

export const useStateWithRef = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const ref = useRef<T>(initialValue);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return [value, setValue, ref] as const;
};
