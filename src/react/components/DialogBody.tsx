import { Button, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Icon } from "./Icon";
import { useMemo } from "react";
import classNames from "classnames";

const DRAGGABLE_ELEMENT_CLASS = "dialog-draggable-handle";

export interface DialogMethods {
  open: () => void;
  close: () => void;
}

export interface DialogActionHandler {
  text: string;
  color?: React.ComponentProps<typeof Button>["color"];
  onClick: () => void;
  default?: boolean;
}

export interface DialogWindowProps extends ChildrenProp {
  title?: string;
  draggable?: boolean;
  close: () => void;
  actions?: readonly DialogActionHandler[];
}

export const DialogBody: React.FC<DialogWindowProps> = ({
  title,
  close,
  draggable = false,
  actions,
  children
}) => {
  const handleEnter = useMemo(() => {
    const defaultAction = actions?.find((a) => a.default);
    if (!defaultAction) {
      return undefined;
    }
    return (e: React.KeyboardEvent) => {
      if (e.code === "Enter") {
        defaultAction.onClick();
      }
    };
  }, [actions]);
  return (
    <>
      <IconButton className="absolute top-1 right-1" onClick={close} size="medium">
        <Icon icon="mdi:close" />
      </IconButton>
      {(title || draggable) && (
        <DialogTitle
          className={classNames("px-5 py-3", draggable && "cursor-move " + DRAGGABLE_ELEMENT_CLASS)}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent dividers onKeyDown={handleEnter}>
        {children}
      </DialogContent>
      <DialogActions className="pr-4">
        {actions?.map((a, i) => (
          <Button
            key={i}
            className="text-xl"
            size="large"
            onClick={a.onClick}
            color={a.color || "inherit"}
          >
            {a.text}
          </Button>
        ))}
        <Button
          key="__cancel__"
          className="text-xl mr-2"
          size="large"
          onClick={close}
          color="inherit"
        >
          Cancel
        </Button>
      </DialogActions>
    </>
  );
};
