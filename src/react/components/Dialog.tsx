import {
  Button,
  Dialog as RawDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@material-ui/core";
import { Icon } from "./Icon";
import { useEffect, useMemo } from "react";
import { useCommandGroup } from "@/hooks/useCommandGroup";

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
  title?: string;
  fullScreen?: boolean;
  opened: boolean;
  close: () => void;
  TransitionComponent?: React.ComponentProps<typeof RawDialog>["TransitionComponent"];
  className?: string;
  actions?: readonly DialogActionHandler[];
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  opened,
  close,
  fullScreen = false,
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
  return (
    <RawDialog
      fullScreen={fullScreen}
      classes={{ paper: className }}
      open={opened}
      onClose={close}
      onKeyPress={handleEnter}
      TransitionComponent={TransitionComponent}
      transitionDuration={200}
    >
      <IconButton className="absolute top-1 right-1" onClick={close}>
        <Icon icon="mdi:close" />
      </IconButton>
      {title && <DialogTitle className="px-5 py-3">{title}</DialogTitle>}
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions className="pr-4">
        {actions?.map((a, i) => (
          <Button key={i} className="text-xl" size="large" onClick={a.onClick} color={a.color}>
            {a.text}
          </Button>
        ))}
        <Button key="__cancel__" className="text-xl mr-2" size="large" onClick={close}>
          Cancel
        </Button>
      </DialogActions>
    </RawDialog>
  );
};
