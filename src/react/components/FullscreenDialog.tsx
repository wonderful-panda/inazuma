import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  withStyles
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

const StyledDialogActions = withStyles({
  root: {
    paddingRight: "1rem"
  }
})(DialogActions);

const CloseButton = withStyles({
  root: {
    position: "absolute",
    top: 6,
    right: 4
  }
})(IconButton);

const DialogActionButton = withStyles({
  root: {
    fontSize: "1.2rem"
  }
})(Button);

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
        <CloseButton onClick={handleClose}>
          <CloseIcon />
        </CloseButton>
      </DialogTitle>
      <DialogContent dividers>{props.children}</DialogContent>
      <StyledDialogActions>
        {props.actions?.map((a, i) => (
          <DialogActionButton key={i} size="large" onClick={a.onClick} color={a.color}>
            {a.text}
          </DialogActionButton>
        ))}
        <DialogActionButton key="__cancel__" size="large" onClick={handleClose}>
          Cancel
        </DialogActionButton>
      </StyledDialogActions>
    </Dialog>
  );
};
