import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide
} from "@material-ui/core";
import { Icon } from "./Icon";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { ComponentProps, forwardRef, KeyboardEvent, useCallback, useMemo } from "react";

export interface DialogMethods {
  open: () => void;
  close: () => void;
}

export interface DialogActionHandler {
  text: string;
  color?: ComponentProps<typeof Button>["color"];
  onClick: () => void;
  default?: boolean;
}

export interface FullscreenDialogProps {
  title: string;
  actions?: readonly DialogActionHandler[];
  isOpened: boolean;
  setOpened: (value: boolean) => void;
}

const TransitionInner = (props: TransitionProps, ref: any) => (
  <Slide direction="right" ref={ref} {...props} mountOnEnter unmountOnExit />
);
const Transition = forwardRef(TransitionInner);

export const FullscreenDialog: React.FC<FullscreenDialogProps> = ({
  title,
  actions,
  isOpened,
  setOpened,
  children
}) => {
  const handleClose = useCallback(() => setOpened(false), [setOpened]);
  const handleEnter = useMemo(() => {
    const defaultAction = actions?.find((a) => a.default);
    if (!defaultAction) {
      return undefined;
    }
    return (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        defaultAction.onClick();
      }
    };
  }, [actions]);
  return (
    <Dialog
      fullScreen
      open={isOpened}
      onClose={handleClose}
      onKeyPress={handleEnter}
      TransitionComponent={Transition}
      transitionDuration={200}
    >
      <DialogTitle>
        {title}
        <IconButton className="absolute top-2 right-2" onClick={handleClose}>
          <Icon icon="mdi:close" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions className="pr-4">
        {actions?.map((a, i) => (
          <Button key={i} className="text-xl" size="large" onClick={a.onClick} color={a.color}>
            {a.text}
          </Button>
        ))}
        <Button key="__cancel__" className="text-xl mr-2" size="large" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
