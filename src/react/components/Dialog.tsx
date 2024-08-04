import { type Button, Dialog as RawDialog, Paper, PaperProps } from "@mui/material";
import Draggable from "react-draggable";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
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
  onClick: (close: () => void) => unknown;
  default?: boolean;
}

export type DialogProps = React.PropsWithChildren<{
  close: () => unknown;
  fullScreen?: boolean;
  draggable?: boolean;
  disableBackdropClick?: boolean;
  opened: boolean;
  TransitionComponent?: React.ComponentProps<typeof RawDialog>["TransitionComponent"];
  className?: string;
}>;

type OnCloseType = Required<React.ComponentProps<typeof RawDialog>>["onClose"];

const DialogContext = createContext({
  draggable: false,
  close: () => {}
});

export const useDialogContext = () => useContext(DialogContext);

export const Dialog: React.FC<DialogProps> = ({
  opened,
  close,
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
  const closeOnEscape = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      if (e.key === "Escape") {
        close();
      }
    },
    [close]
  );
  const ctx = useMemo(() => ({ draggable, close }), [draggable, close]);
  return (
    <DialogContext.Provider value={ctx}>
      <RawDialog
        fullScreen={fullScreen}
        classes={{ paper: className }}
        open={opened}
        onClose={handleClose}
        TransitionComponent={TransitionComponent}
        transitionDuration={200}
        PaperComponent={draggable ? PaperComponent : undefined}
        disableEscapeKeyDown
        onKeyDownCapture={closeOnEscape}
      >
        {children}
      </RawDialog>
    </DialogContext.Provider>
  );
};
