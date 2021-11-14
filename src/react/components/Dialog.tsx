import {
  Button,
  Dialog as RawDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@material-ui/core";
import { Icon } from "./Icon";
import { useCallback, useMemo } from "react";

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

export interface DialogProps {
  title: string;
  fullScreen?: boolean;
  isOpened: boolean;
  setOpened: (value: boolean) => void;
  TransitionComponent?: React.ComponentProps<typeof RawDialog>["TransitionComponent"];
  className?: string;
  actions?: readonly DialogActionHandler[];
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  isOpened,
  setOpened,
  fullScreen = false,
  TransitionComponent,
  className,
  actions,
  children
}) => {
  const handleClose = useCallback(() => setOpened(false), [setOpened]);
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
    <RawDialog
      fullScreen={fullScreen}
      classes={{ paper: className }}
      open={isOpened}
      onClose={handleClose}
      onKeyPress={handleEnter}
      TransitionComponent={TransitionComponent}
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
    </RawDialog>
  );
};
