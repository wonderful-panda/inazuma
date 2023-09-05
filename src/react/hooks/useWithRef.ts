import { useLayoutEffect, useRef } from "react";

export const useWithRef = <T>(value: T) => {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return [value, ref] as const;
};
