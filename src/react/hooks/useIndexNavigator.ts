import { throttled } from "@/util";
import type React from "react";
import { useMemo } from "react";

export interface IndexNavigator {
  set: React.Dispatch<React.SetStateAction<number>>;
  moveNext: () => void;
  movePrevious: () => void;
  moveFirst: () => void;
  moveLast: () => void;
  handleKeyboardEvent: (event: React.KeyboardEvent) => boolean;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
}

export const nullIndexNavigator: IndexNavigator = {
  set: () => {},
  moveNext: () => {},
  movePrevious: () => {},
  moveFirst: () => {},
  moveLast: () => {},
  handleKeyboardEvent: () => false,
  handleRowClick: () => {}
};

const useIndexNavigator = (
  itemsCount: number,
  setValue: React.Dispatch<React.SetStateAction<number>>,
  extraKeyHandlers?: Record<string, () => void>
): IndexNavigator => {
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
    const handleKeyboardEvent = (event: React.KeyboardEvent) => {
      const handler = (throttledHandler as Record<string, () => void>)[event.key];
      if (handler) {
        handler();
        return true;
      } else {
        return false;
      }
    };
    const handleRowClick = (_event: React.MouseEvent, index: number) => {
      setValue(index);
    };
    return {
      set: setValue,
      moveNext,
      movePrevious,
      moveFirst,
      moveLast,
      handleKeyboardEvent,
      handleRowClick
    };
  }, [itemsCount, setValue, extraKeyHandlers]);
};

export default useIndexNavigator;
