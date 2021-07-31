import { useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import Splitter, { SplitterDirection } from "./Splitter";

const FLEX_SUM = 1000;

export interface SplitterPanelProps {
  first: React.ReactNode;
  second: React.ReactNode;
  direction?: SplitterDirection;
  splitterThickness: number;
  ratio: number;
  onUpdateRatio: (value: number) => void;
  firstPanelMinSize?: string;
  secondPanelMinSize?: string;
  showFirstPanel?: boolean;
  showSecondPanel?: boolean;
  allowDirectionChange?: boolean;
  onUpdateDirection?: (value: SplitterDirection) => void;
}

const Container = styled.div<{ horiz: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: ${(p) => (p.horiz ? "row" : "column")};
  flex-wrap: nowrap;
  align-items: stretch;
  overflow: hidden;
`;

const Panel = styled.div<{
  show: boolean;
  horiz: boolean;
  minSize: string;
}>`
  display: ${(p) => (p.show ? "flex" : "none")};
  flex-direction: ${(p) => (p.horiz ? "row" : "column")};
  align-items: stretch;
  overflow: auto;
  min-width: ${(p) => (p.horiz ? p.minSize : undefined)};
  min-height: ${(p) => (p.horiz ? undefined : p.minSize)};
`;

const SplitterPanel: React.VFC<SplitterPanelProps> = ({
  first,
  second,
  direction = "horiz",
  splitterThickness,
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
    return [{ flex: flexFirst }, { flex: flexSecond }];
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
    <Container horiz={direction === "horiz"}>
      <Panel
        ref={firstRef}
        show={showFirstPanel}
        horiz={direction === "horiz"}
        minSize={firstPanelMinSize}
        style={flexFirst}
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
        style={flexSecond}
      >
        {second}
      </Panel>
    </Container>
  );
};

export default SplitterPanel;
