import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { ComponentProps, forwardRef, useCallback } from "react";

export interface DialogHandler {
  open: () => void;
  close: () => void;
}

export interface DialogActionHandler {
  text: string;
  color?: ComponentProps<typeof Button>["color"];
  onClick: () => void;
}

export interface FullscreenDialogProps {
  title: string;
  actions?: readonly DialogActionHandler[];
  isOpened: boolean;
  setOpened: (value: boolean) => void;
}

const Transition = forwardRef((props: TransitionProps, ref) => (
  <Slide direction="right" ref={ref} {...props} mountOnEnter unmountOnExit />
));

export const FullscreenDialog: React.FC<FullscreenDialogProps> = (props) => {
  const handleClose = useCallback(() => props.setOpened(false), []);
  return (
    <Dialog
      fullScreen
      open={props.isOpened}
      onClose={handleClose}
      TransitionComponent={Transition}
      transitionDuration={200}
    >
      <DialogTitle>
        {props.title}
        <IconButton className="absolute top-2 right-2" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{props.children}</DialogContent>
      <DialogActions className="pr-4">
        {props.actions?.map((a, i) => (
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
