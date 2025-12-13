import { useRef } from "react";

export const useWithRef = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return [value, ref] as const;
};
