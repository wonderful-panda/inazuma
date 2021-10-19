import { useSelectedIndexMethods } from "@/hooks/useSelectedIndex";
import { throttle } from "lodash";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";

export interface KeyboardSelectionProps {
  tabIndex?: number;
  className?: string;
  children: React.ReactNode;
}
export interface KeyboardSelectionMethods {
  focus: () => void;
}

const KeyboardSelection = forwardRef<KeyboardSelectionMethods, KeyboardSelectionProps>(
  ({ className, tabIndex = 0, children }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      focus: () => divRef.current?.focus()
    }));
    const selectedIndexMethods = useSelectedIndexMethods();
    const moveSelectedIndex = useMemo(
      () =>
        throttle((key: string) => {
          switch (key) {
            case "ArrowDown":
              selectedIndexMethods.moveNext();
              break;
            case "ArrowUp":
              selectedIndexMethods.movePrevious();
              break;
            case "Home":
              selectedIndexMethods.moveFirst();
              break;
            case "End":
              selectedIndexMethods.moveLast();
              break;
            default:
              break;
          }
        }, 150),
      [selectedIndexMethods]
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
