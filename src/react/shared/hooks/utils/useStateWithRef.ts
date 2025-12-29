import { useRef, useState } from "react";

export const useStateWithRef = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const ref = useRef<T>(initialValue);
  ref.current = value;
  return [value, setValue, ref] as const;
};
