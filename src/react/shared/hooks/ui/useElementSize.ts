import { useEffect, useRef, useState } from "react";

export const useElementSize = <E extends HTMLElement = HTMLDivElement>(
  onResize?: (size: { width: number; height: number }) => void
) => {
  const ref = useRef<E>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((e) => {
        const { width, height } = e.contentRect;
        setSize({ width, height });
        onResize?.({ width, height });
      });
    });
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }
    return () => resizeObserver.disconnect();
  }, [onResize]);

  return [ref, size] as const;
};
