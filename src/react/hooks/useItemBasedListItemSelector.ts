import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

/**
 * Obtain selectedItem(state) and selectedIndex(computed property)
 *
 * @param items array of list items
 * @returns
 */
export const useItemBasedListItemSelector = <T>(
  items: readonly T[]
): {
  selectedItem: T | undefined;
  setSelectedItem: Dispatch<SetStateAction<T | undefined>>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
} => {
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);
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
  return {
    selectedItem,
    setSelectedItem,
    selectedIndex,
    setSelectedIndex
  };
};
