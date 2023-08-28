import { Button, Dialog as RawDialog, Paper, PaperProps } from "@mui/material";
import Draggable from "react-draggable";
import { useCallback, useEffect } from "react";
import { useCommandGroup } from "@/hooks/useCommandGroup";

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
  fullScreen?: boolean;
  draggable?: boolean;
  disableBackdropClick?: boolean;
  opened: boolean;
  TransitionComponent?: React.ComponentProps<typeof RawDialog>["TransitionComponent"];
  className?: string;
}

type OnCloseType = Required<React.ComponentProps<typeof RawDialog>>["onClose"];

export const Dialog: React.FC<DialogProps> = ({
  opened,
  fullScreen = false,
  draggable = false,
  disableBackdropClick = false,
  TransitionComponent,
  className,
  children
}) => {
  const commandGroup = useCommandGroup();
  useEffect(() => {
    if (opened) {
      commandGroup.suspend();
      return () => commandGroup.resume();
    }
  }, [opened, commandGroup]);
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
      {children}
    </RawDialog>
  );
};
