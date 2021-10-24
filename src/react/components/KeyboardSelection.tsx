import { useSelectedIndexMethods } from "@/hooks/useSelectedIndex";
import { throttle } from "lodash";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";

export interface KeyboardSelectionProps {
  tabIndex?: number;
  className?: string;
  children: React.ReactNode;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
}
export interface KeyboardSelectionMethods {
  focus: () => void;
}

const KeyboardSelectionInner: ForwardRefRenderFunction<
  KeyboardSelectionMethods,
  KeyboardSelectionProps
> = ({ className, tabIndex = 0, children, ...rest }, ref) => {
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
    <div ref={divRef} className={className} tabIndex={tabIndex} onKeyDown={onKeyDown} {...rest}>
      {children}
    </div>
  );
};
export default forwardRef(KeyboardSelectionInner);
