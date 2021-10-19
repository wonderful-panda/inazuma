import { useSelectedIndexHandler } from "@/hooks/useSelectedIndex";
import { throttle } from "lodash";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";

export interface KeyboardSelectionProps {
  tabIndex?: number;
  className?: string;
  children: React.ReactNode;
}
export interface KeyboardSelectionHandler {
  focus: () => void;
}

const KeyboardSelection = forwardRef<KeyboardSelectionHandler, KeyboardSelectionProps>(
  ({ className, tabIndex = 0, children }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      focus: () => divRef.current?.focus()
    }));
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
      <div ref={divRef} className={className} tabIndex={tabIndex} onKeyDown={onKeyDown}>
        {children}
      </div>
    );
  }
);

export default KeyboardSelection;
