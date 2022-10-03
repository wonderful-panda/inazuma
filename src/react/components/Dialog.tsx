import {
  Button,
  Dialog as RawDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  PaperProps
} from "@mui/material";
import Draggable from "react-draggable";
import { Icon } from "./Icon";
import { useCallback, useEffect, useMemo } from "react";
import { useCommandGroup } from "@/hooks/useCommandGroup";
import classNames from "classnames";

const DRAGGABLE_ELEMENT_CLASS = "dialog-draggable-handle";

const PaperComponent = (props: PaperProps) => {
  return (
    <Draggable handle={"." + DRAGGABLE_ELEMENT_CLASS} cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

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

export interface DialogProps extends ChildrenProp {
  title?: string;
  fullScreen?: boolean;
  draggable?: boolean;
  disableBackdropClick?: boolean;
  opened: boolean;
  close: () => void;
  TransitionComponent?: React.ComponentProps<typeof RawDialog>["TransitionComponent"];
  className?: string;
  actions?: readonly DialogActionHandler[];
}

type OnCloseType = Required<React.ComponentProps<typeof RawDialog>>["onClose"];

export const Dialog: React.FC<DialogProps> = ({
  title,
  opened,
  close,
  fullScreen = false,
  draggable = false,
  disableBackdropClick = false,
  TransitionComponent,
  className,
  actions,
  children
}) => {
  const commandGroup = useCommandGroup();
  useEffect(() => {
    if (opened) {
      commandGroup.suspend();
      return () => commandGroup.resume();
    }
  }, [opened, commandGroup]);
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
  const handleClose = useCallback<OnCloseType>(
    (_, reason) => {
      if (reason !== "backdropClick" || !disableBackdropClick) {
        close();
      }
    },
    [disableBackdropClick, close]
  );
  return (
    <RawDialog
      fullScreen={fullScreen}
      classes={{ paper: className }}
      open={opened}
      onClose={handleClose}
      TransitionComponent={TransitionComponent}
      transitionDuration={200}
      PaperComponent={draggable ? PaperComponent : undefined}
    >
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
      <DialogContent dividers onKeyPress={handleEnter}>
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
    </RawDialog>
  );
};
