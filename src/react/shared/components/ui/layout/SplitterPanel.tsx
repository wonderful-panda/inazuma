import classNames from "classnames";
import { useCallback, useMemo, useRef } from "react";
import { Splitter } from "./Splitter";

const FLEX_SUM = 1000;

export interface SplitterPanelProps {
  first: React.ReactNode | ((direction: Direction, show: boolean) => React.ReactNode);
  second: React.ReactNode | ((direction: Direction, show: boolean) => React.ReactNode);
  direction?: Direction;
  splitterThickness?: number;
  ratio: number;
  onUpdateRatio: (value: number) => void;
  firstPanelMinSize?: string;
  secondPanelMinSize?: string;
  showFirstPanel?: boolean;
  showSecondPanel?: boolean;
  allowDirectionChange?: boolean;
  onUpdateDirection?: (value: Direction) => void;
}

interface PanelProps {
  show: boolean;
  horiz: boolean;
  flex: number;
  minSize: string;
  children: React.ReactNode | ((direction: Direction, show: boolean) => React.ReactNode);
}
const Panel: React.FC<PanelProps & { ref?: React.Ref<HTMLDivElement> }> = ({
  show,
  horiz,
  flex,
  minSize,
  children,
  ref
}) => (
  <div
    ref={ref}
    className={classNames(
      "items-stretch overflow-hidden",
      show ? "flex" : "hidden",
      horiz ? "flex-row" : "flex-col"
    )}
    style={{
      minWidth: horiz ? minSize : undefined,
      minHeight: horiz ? undefined : minSize,
      flex
    }}
  >
    {typeof children === "function" ? children(horiz ? "horiz" : "vert", show) : children}
  </div>
);

export const SplitterPanel: React.FC<SplitterPanelProps> = ({
  first,
  second,
  direction = "horiz",
  splitterThickness = 5,
  ratio,
  onUpdateRatio,
  firstPanelMinSize = "10%",
  secondPanelMinSize = "10%",
  showFirstPanel = true,
  showSecondPanel = true,
  allowDirectionChange = false,
  onUpdateDirection
}) => {
  const [flexFirst, flexSecond] = useMemo(() => {
    const flexFirst = Math.floor(FLEX_SUM * ratio);
    const flexSecond = FLEX_SUM - flexFirst;
    return [flexFirst, flexSecond];
  }, [ratio]);

  const firstRef = useRef<HTMLDivElement | null>(null);
  const secondRef = useRef<HTMLDivElement | null>(null);

  const onSplitterPositionChange = useCallback(
    (position: number) => {
      if (!firstRef.current || !secondRef.current) {
        return;
      }
      const docBound = document.body.getBoundingClientRect();
      const firstBound = firstRef.current.getBoundingClientRect();
      let newRatio: number;
      if (direction === "horiz") {
        const firstClientWidth = firstRef.current.clientWidth;
        const sum = firstClientWidth + secondRef.current.clientWidth;
        const newFirstClientWidth =
          position -
          (firstBound.left - docBound.left) /* pageX of first panel */ -
          (firstBound.width - firstClientWidth); /* scrollbar width */
        newRatio = newFirstClientWidth / sum;
      } else {
        const firstClientHeight = firstRef.current.clientHeight;
        const sum = firstClientHeight + secondRef.current.clientHeight;
        const newFirstClientHeight =
          position -
          (firstBound.top - docBound.top) /* pageY of first panel */ -
          (firstBound.height - firstClientHeight); /* scrollbar height */
        newRatio = newFirstClientHeight / sum;
      }
      onUpdateRatio(newRatio);
    },
    [direction, onUpdateRatio]
  );

  return (
    <div
      className={classNames("flex flex-1 flex-nowrap items-stretch overflow-hidden", {
        "flex-row": direction === "horiz",
        "flex-col": direction !== "horiz"
      })}
    >
      <Panel
        ref={firstRef}
        show={showFirstPanel}
        horiz={direction === "horiz"}
        minSize={firstPanelMinSize}
        flex={flexFirst}
      >
        {first}
      </Panel>
      {showFirstPanel && showSecondPanel && (
        <Splitter
          horiz={direction === "horiz"}
          thickness={splitterThickness}
          allowDirectionChange={allowDirectionChange}
          onUpdateDirection={onUpdateDirection}
          onPositionChange={onSplitterPositionChange}
        />
      )}
      <Panel
        ref={secondRef}
        show={showSecondPanel}
        horiz={direction === "horiz"}
        minSize={secondPanelMinSize}
        flex={flexSecond}
      >
        {second}
      </Panel>
    </div>
  );
};
