import { Button, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef } from "react";
import classNames from "classnames";
import { DialogActionHandler, useDialogContext } from "./Dialog";

const DRAGGABLE_ELEMENT_CLASS = "dialog-draggable-handle";

export interface DialogBodyProps extends ChildrenProp {
  title?: string;
  className?: string;
  actions?: readonly DialogActionHandler[];
  focusDefaultButton?: boolean;
  defaultActionKey?: "Enter" | "Alt+Enter" | "Ctrl+Enter";
}

export const DialogBody: React.FC<DialogBodyProps> = ({
  title,
  className,
  actions,
  children,
  focusDefaultButton,
  defaultActionKey
}) => {
  const defaultButtonRef = useRef<HTMLButtonElement>(null);
  const composingRef = useRef(false);
  const ctx = useDialogContext();
  const handleCompositionStart = useCallback(() => (composingRef.current = true), []);
  const handleCompositionEnd = useCallback(() => (composingRef.current = false), []);
  const handleEnter = useCallback(
    (e: React.KeyboardEvent) => {
      if (!defaultActionKey) {
        return;
      }
      const defaultAction = actions?.find((a) => a.default);
      if (!defaultAction) {
        return;
      }
      if (e.code === "Enter" && !e.shiftKey && !composingRef.current) {
        const key = `${e.ctrlKey ? "Ctrl+" : ""}${e.altKey ? "Alt+" : ""}Enter`;
        if (key === defaultActionKey) {
          e.stopPropagation();
          defaultAction.onClick();
        }
      }
    },
    [actions, defaultActionKey]
  );
  useEffect(() => {
    if (defaultButtonRef.current && focusDefaultButton) {
      defaultButtonRef.current.focus({ focusVisible: true } as any);
    }
  }, [focusDefaultButton]);
  return (
    <div className={className}>
      <IconButton className="absolute top-1 right-1" onClick={ctx.close} size="medium">
        <Icon icon="mdi:close" />
      </IconButton>
      {(title || ctx.draggable) && (
        <DialogTitle
          className={classNames(
            "px-5 py-3",
            ctx.draggable && "cursor-move " + DRAGGABLE_ELEMENT_CLASS
          )}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent
        dividers
        onKeyDownCapture={handleEnter}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      >
        {children}
      </DialogContent>
      <DialogActions className="pr-4">
        {actions?.map((a, i) => (
          <Button
            key={i}
            ref={a.default ? defaultButtonRef : undefined}
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
          onClick={ctx.close}
          color="inherit"
        >
          Cancel
        </Button>
      </DialogActions>
    </div>
  );
};
