import { useMemo, useState } from "react";

const useListIndex = <T extends unknown>(initialIndex: number, items: T[]) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const handler = useMemo(
    () => ({
      setSelectedIndex,
      selectNextItem: (loop: boolean = false): void => {
        setSelectedIndex((cur) => {
          if (cur < items.length - 1) {
            return cur + 1;
          } else {
            return loop ? 0 : cur;
          }
        });
      },
      selectPreviousItem: (loop: boolean = false): void => {
        setSelectedIndex((cur) => {
          if (0 < cur) {
            return cur - 1;
          } else {
            return loop ? items.length - 1 : cur;
          }
        });
      }
    }),
    [items]
  );

  return [selectedIndex, handler] as const;
};

export default useListIndex;
