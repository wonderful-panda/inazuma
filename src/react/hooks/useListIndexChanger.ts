import { throttled } from "@/util";
import type React from "react";
import { useMemo } from "react";

export interface ListItemSelector {
  set: SetState<number>;
  moveNext: () => void;
  movePrevious: () => void;
  moveFirst: () => void;
  moveLast: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => boolean;
  handleRowMouseDown: (event: React.MouseEvent, index: number) => void;
}

export const useListIndexChanger = (
  itemsCount: number,
  setValue: SetState<number>,
  extraKeyHandlers?: Record<string, () => void>
): ListItemSelector => {
  return useMemo(() => {
    const moveNext = () => {
      if (0 < itemsCount) {
        setValue((cur) => (cur < itemsCount - 1 ? cur + 1 : itemsCount - 1));
      }
    };
    const movePrevious = () => {
      if (0 < itemsCount) {
        setValue((cur) => (1 <= cur ? cur - 1 : 0));
      }
    };
    const moveFirst = () => {
      if (0 < itemsCount) {
        setValue(0);
      }
    };
    const moveLast = () => {
      if (0 < itemsCount) {
        setValue(itemsCount - 1);
      }
    };
    const throttledHandler = throttled(
      {
        ArrowUp: movePrevious,
        ArrowDown: moveNext,
        Home: moveFirst,
        End: moveLast,
        ...extraKeyHandlers
      },
      120
    );
    const handleKeyDown = (event: React.KeyboardEvent) => {
      const handler = (throttledHandler as Record<string, () => void>)[event.key];
      if (handler) {
        handler();
        return true;
      } else {
        return false;
      }
    };
    const handleRowMouseDown = (event: React.MouseEvent, index: number) => {
      if (event.button === 0) {
        setValue(index);
      }
    };
    return {
      set: setValue,
      moveNext,
      movePrevious,
      moveFirst,
      moveLast,
      handleKeyDown,
      handleRowMouseDown
    };
  }, [itemsCount, setValue, extraKeyHandlers]);
};
