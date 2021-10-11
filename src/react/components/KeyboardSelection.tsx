import { throttle } from "lodash";
import { Dispatch, SetStateAction, useCallback } from "react";

const KeyboardSelection: React.FC<{
  itemsCount: number;
  setIndex: Dispatch<SetStateAction<number>>;
  tabIndex?: number;
  className?: string;
}> = ({ itemsCount, setIndex, className, tabIndex = 0, children }) => {
  const setIndexThrottled = useCallback(throttle(setIndex, 150), [setIndex]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          setIndexThrottled((prev) => Math.min(prev + 1, itemsCount - 1));
          e.stopPropagation();
          break;
        case "ArrowUp":
          setIndexThrottled((prev) => Math.max(prev - 1, 0));
          e.stopPropagation();
          break;
        case "Home":
          setIndexThrottled(0);
          e.stopPropagation();
          break;
        case "End":
          setIndexThrottled(itemsCount - 1);
          e.stopPropagation();
          break;
        default:
          break;
      }
    },
    [itemsCount, setIndex]
  );
  return (
    <div className={className} tabIndex={tabIndex} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
};

export default KeyboardSelection;
