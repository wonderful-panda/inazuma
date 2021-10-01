import { vname } from "@/cssvar";
import { IconButton } from "@material-ui/core";
import { useCallback, useState } from "react";
import styled from "styled-components";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

const HOVER_COLOR = `var(${vname("backgroundPaper")})`;

interface SplitterProps {
  horiz: boolean;
  thickness: number;
  allowDirectionChange: boolean;
  onUpdateDirection?: (value: Direction) => void;
  onPositionChange: (position: number) => void;
}
const RotateButton = styled(IconButton)<{ $dragging: boolean }>`
  &&& {
    visibility: ${(p) => (p.$dragging ? "visible" : "hidden")};
    position: absolute;
    transition: transform 0.2s ease;
    margin: auto;
    background-color: ${HOVER_COLOR};
    max-width: 48px;
    max-height: 48px;
    left: -24px;
    right: -24px;
    top: -24px;
    bottom: -24px;
    &:hover {
      transform: rotate(90deg);
    }
  }
`;

const SplitterDiv = styled.div<{
  $horiz: boolean;
  $thickness: number;
  $dragging: boolean;
}>`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: ${(p) => p.$thickness}px;
  box-sizing: border-box;
  position: relative;
  cursor: ${(p) => (p.$horiz ? "col-resize" : "row-resize")};
  margin: ${(p) => (p.$horiz ? "0 1px" : "1px 0")};
  background-color: ${(p) => (p.$dragging ? HOVER_COLOR : "inherit")};
  z-index: 9999;
  &:hover {
    background-color: ${HOVER_COLOR};
    visibility: visible;
    ${RotateButton} {
      visibility: visible;
    }
  }
`;

const Splitter: React.VFC<SplitterProps> = (p) => {
  const [dragging, setDragging] = useState(false);
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const getPosition = (e: React.MouseEvent | MouseEvent) =>
        (p.horiz ? e.pageX : e.pageY) - p.thickness / 2;
      event.stopPropagation();
      event.preventDefault();
      setDragging(true);
      p.onPositionChange(getPosition(event));
      const onMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        p.onPositionChange(getPosition(e));
      };
      const onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDragging(false);
        p.onPositionChange(getPosition(e));
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [p.horiz, p.thickness, p.onPositionChange]
  );
  const onUpdateDirection = useCallback(() => {
    p.onUpdateDirection?.(p.horiz ? "vert" : "horiz");
  }, [p.horiz]);
  return (
    <SplitterDiv
      $horiz={p.horiz}
      $thickness={p.thickness}
      $dragging={dragging}
      onMouseDown={onMouseDown}
    >
      {p.allowDirectionChange && (
        <RotateButton $dragging={dragging} onClick={onUpdateDirection}>
          {p.horiz ? <SwapHorizIcon /> : <SwapVertIcon />}
        </RotateButton>
      )}
    </SplitterDiv>
  );
};

export default Splitter;
