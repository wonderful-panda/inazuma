import { useSelectedIndexHandler } from "@/hooks/useSelectedIndex";
import { throttle } from "lodash";
import { useCallback, useMemo } from "react";

const KeyboardSelection: React.FC<{
  tabIndex?: number;
  className?: string;
}> = ({ className, tabIndex = 0, children }) => {
  const selectedIndexHandler = useSelectedIndexHandler();
  const moveSelectedIndex = useMemo(
    () =>
      throttle((key: string) => {
        switch (key) {
          case "ArrowDown":
            selectedIndexHandler.moveNext();
            break;
          case "ArrowUp":
            selectedIndexHandler.movePrevious();
            break;
          case "Home":
            selectedIndexHandler.moveFirst();
            break;
          case "End":
            selectedIndexHandler.moveLast();
            break;
          default:
            break;
        }
      }, 150),
    [selectedIndexHandler]
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
        e.stopPropagation();
        moveSelectedIndex(e.key);
      }
    },
    [moveSelectedIndex]
  );
  return (
    <div className={className} tabIndex={tabIndex} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
};

export default KeyboardSelection;
