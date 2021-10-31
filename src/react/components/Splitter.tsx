import classNames from "classnames";
import { IconButton } from "@material-ui/core";
import { useCallback, useState } from "react";
import { Icon } from "@iconify/react";

interface SplitterProps {
  horiz: boolean;
  thickness: number;
  allowDirectionChange: boolean;
  onUpdateDirection?: (value: Direction) => void;
  onPositionChange: (position: number) => void;
}

const RotateButton: React.VFC<{
  dragging: boolean;
  horiz: boolean;
  onClick: () => void;
}> = ({ dragging, horiz, onClick }) => (
  <IconButton
    className={classNames(
      "absolute -left-6 -right-6 -top-6 -bottom-6 w-12 h-12 m-auto",
      "bg-splitter shadow-lg",
      "transform group-hover:visible",
      "transition-transform duration-200 ease-linear",
      horiz ? "hover:rotate-90" : "hover:-rotate-90",
      dragging ? "visible" : "invisible"
    )}
    title="Switch direction"
    onClick={onClick}
  >
    <Icon icon={`carbon:drag-${horiz ? "horizontal" : "vertical"}`} />
  </IconButton>
);

const Splitter: React.VFC<SplitterProps> = ({
  horiz,
  thickness,
  allowDirectionChange,
  onPositionChange,
  onUpdateDirection
}) => {
  const [dragging, setDragging] = useState(false);
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const getPosition = (e: React.MouseEvent | MouseEvent) =>
        (horiz ? e.pageX : e.pageY) - thickness / 2;
      event.stopPropagation();
      event.preventDefault();
      setDragging(true);
      onPositionChange(getPosition(event));
      const onMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onPositionChange(getPosition(e));
      };
      const onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDragging(false);
        onPositionChange(getPosition(e));
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [horiz, thickness, onPositionChange]
  );
  const handleUpdateDirection = useCallback(() => {
    onUpdateDirection?.(horiz ? "vert" : "horiz");
  }, [horiz, onUpdateDirection]);
  return (
    <div
      className={classNames(
        "relative box-border z-999 flex-grow-0 flex-shrink-0 group hover:bg-splitter",
        {
          "cursor-col-resize mx-px my-0": horiz,
          "cursor-row-resize mx-0 my-px": !horiz,
          "bg-splitter": dragging
        }
      )}
      style={{ flexBasis: thickness }}
      onMouseDown={onMouseDown}
    >
      {allowDirectionChange && (
        <RotateButton horiz={horiz} dragging={dragging} onClick={handleUpdateDirection} />
      )}
    </div>
  );
};

export default Splitter;
