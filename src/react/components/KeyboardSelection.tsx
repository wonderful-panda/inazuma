import { useSelectedIndexMethods } from "@/hooks/useSelectedIndex";
import { throttle } from "lodash";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";

export interface KeyboardSelectionProps {
  tabIndex?: number;
  className?: string;
  extraHandlers?: Record<string, (e: React.KeyboardEvent) => void>;
  children: React.ReactNode;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
}
export interface KeyboardSelectionMethods {
  focus: () => void;
}

const KeyboardSelectionInner: React.ForwardRefRenderFunction<
  KeyboardSelectionMethods,
  KeyboardSelectionProps
> = ({ className, tabIndex = 0, extraHandlers, children, ...rest }, ref) => {
  const divRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => divRef.current?.focus()
  }));
  const selectedIndexMethods = useSelectedIndexMethods();
  const moveSelectedIndex = useMemo(
    () =>
      throttle((e: React.KeyboardEvent) => {
        switch (e.key) {
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
            extraHandlers?.[e.key](e);
            break;
        }
      }, 150),
    [selectedIndexMethods, extraHandlers]
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Home" ||
        e.key === "End" ||
        extraHandlers?.[e.key]
      ) {
        e.stopPropagation();
        moveSelectedIndex(e);
      }
    },
    [moveSelectedIndex]
  );
  return (
    <div ref={divRef} className={className} tabIndex={tabIndex} onKeyDown={onKeyDown} {...rest}>
      {children}
    </div>
  );
};
export default forwardRef(KeyboardSelectionInner);
