import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

/**
 * Obtain [selectedIndex, setSelectedIndex] from [selectedItem, setSelectedItem]
 * @param items
 * @param selectedItem
 * @param setSelectedItem
 * @returns
 */
export const useListIndexOfItem = <T>(
  items: readonly T[],
  selectedItem: T | undefined,
  setSelectedItem: Dispatch<SetStateAction<T | undefined>>
): [number, Dispatch<SetStateAction<number>>] => {
  const selectedIndex = useMemo(
    () => (selectedItem ? items.indexOf(selectedItem) : -1),
    [items, selectedItem]
  );
  const setSelectedIndex = useCallback(
    (value: SetStateAction<number>) => {
      if (value instanceof Function) {
        setSelectedItem((prev) => {
          const prevIndex = prev ? items.indexOf(prev) : -1;
          const newIndex = value(prevIndex);
          return items[newIndex];
        });
      } else {
        setSelectedItem(items[value]);
      }
    },
    [items, setSelectedItem]
  );
  return [selectedIndex, setSelectedIndex];
};
