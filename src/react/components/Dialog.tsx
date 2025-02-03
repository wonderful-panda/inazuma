import { useStateWithRef } from "@/hooks/useStateWithRef";
import { assertNever, wait } from "@/util";
import {
  DndContext,
  type DragEndEvent,
  type DraggableAttributes,
  useDraggable
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { Icon } from "@iconify/react";
import { Button, Checkbox, FormControlLabel, IconButton, Paper, Radio } from "@mui/material";
import classNames from "classnames";
import type React from "react";
import {
  createContext,
  type CSSProperties,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

export interface DialogAction {
  text: string;
  color?: React.ComponentProps<typeof Button>["color"];
  onClick: (close: (ret: DialogResult) => Promise<boolean>) => unknown;
  disabled?: boolean;
  default?: boolean;
}

export interface DialogProps {
  content: React.ReactNode;
  fullscreen?: boolean;
  onBeforeClose?: (ret: DialogResult) => Promise<boolean>;
  defaultActionKey?: "Enter" | "Ctrl+Enter";
}

const defaultProps: DialogProps = {
  content: <></>
};

export type DialogResult =
  | {
      result: "rejected" | "notready";
    }
  | {
      result: "accepted";
      detail?: string;
    };

const dialogResultToReturnValue = (ret: DialogResult): string => {
  switch (ret.result) {
    case "accepted":
      return `accepted:${ret.detail}`;
    case "rejected":
    case "notready":
      return ret.result;
  }
};

const returnValueToDialogResult = (value: string): DialogResult => {
  if (!value) {
    return { result: "rejected" };
  }
  switch (value) {
    case "accepted":
    case "rejected":
    case "notready":
      return { result: value };
    default:
      if (value.startsWith("accepted:")) {
        return { result: "accepted", detail: value.substring("accepted:".length) };
      } else {
        throw new Error("Dialog: unexpected returnValue");
      }
  }
};

const isDefaultActionKeyEvent = (
  e: React.KeyboardEvent,
  defaultActionKey: "Enter" | "Ctrl+Enter"
): boolean => {
  switch (defaultActionKey) {
    case "Enter":
      return e.code === "Enter" && !e.ctrlKey && !e.altKey && !e.shiftKey;
    case "Ctrl+Enter":
      return e.code === "Enter" && e.ctrlKey && !e.altKey && !e.shiftKey;
    default:
      assertNever(defaultActionKey);
      return false;
  }
};

export interface DialogMethods {
  showModal: (props: DialogProps) => Promise<DialogResult>;
}

const innerCtx = createContext<{
  fullscreen: boolean;
  draggable: boolean;
  attributes: DraggableAttributes | undefined;
  listeners: SyntheticListenerMap | undefined;
  close: (ret: DialogResult) => Promise<boolean>;
}>({
  fullscreen: false,
  draggable: false,
  attributes: undefined,
  listeners: undefined,
  close: () => Promise.resolve(false)
});

export const DialogTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { draggable, attributes, listeners } = useContext(innerCtx);
  const dragProps = draggable ? { ...attributes, ...listeners, tabIndex: undefined } : {};
  return (
    <div
      className={classNames(
        "px-4 pb-2 border-b border-highlight pt-3 font-bold",
        draggable && "cursor-move"
      )}
      {...dragProps}
    >
      {children}
    </div>
  );
};

export const DialogContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { fullscreen } = useContext(innerCtx);
  return (
    <div
      className={classNames(
        "flex-col-nowrap p-4 text-lg border-b border-highlight min-w-[40rem]",
        fullscreen && "flex-1"
      )}
    >
      {children}
    </div>
  );
};

export const DialogSection: React.FC<React.PropsWithChildren<{ label: string }>> = ({
  label,
  children
}) => {
  return (
    <>
      <div className="text-primary">{label}</div>
      <div className="ml-6 mb-3 px-2 flex-col-nowrap">{children}</div>
    </>
  );
};

export const LabelledCheckBox: React.FC<{
  label: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, inputRef, onChange }) => {
  return (
    <FormControlLabel
      className="h-8"
      control={<Checkbox inputRef={inputRef} onChange={onChange} />}
      label={label}
    />
  );
};

export const LabelledRadio: React.FC<{
  value: string;
  label: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}> = ({ value, label, disabled }) => {
  return (
    <FormControlLabel
      className="h-8"
      value={value}
      control={<Radio />}
      label={label}
      disabled={disabled}
    />
  );
};

export const DialogActions: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex-row-nowrap my-2">
    <div className="flex-1" />
    {children}
  </div>
);

export const DialogButton: React.FC<DialogAction> = ({
  text,
  color = "inherit",
  onClick,
  disabled,
  default: default_
}) => {
  const { close } = useContext(innerCtx);
  const handleClick = useCallback(() => onClick(close), [onClick, close]);
  return (
    <Button
      className={classNames("mr-4 text-xl", default_ && "__default")}
      disabled={disabled}
      color={color}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

export const AcceptButton: React.FC<{
  text?: string;
  onClick: () => Promise<boolean | "failed">;
  disabled?: boolean;
  default?: boolean;
}> = ({ text = "OK", onClick, disabled, default: default_ }) => {
  const handleClick = useCallback(
    async (close: (ret: DialogResult) => void) => {
      const ret = await onClick();
      if (ret && ret !== "failed") {
        close({ result: "accepted" });
      }
    },
    [onClick]
  );
  return (
    <DialogButton
      text={text}
      onClick={handleClick}
      disabled={disabled}
      color="primary"
      default={default_}
    />
  );
};

export const CancelButton: React.FC<{ text?: string; disabled?: boolean; default?: boolean }> = ({
  text = "Cancel",
  disabled,
  default: default_
}) => {
  const onClick = useCallback(
    (close: (ret: DialogResult) => void) => close({ result: "rejected" }),
    []
  );
  return (
    <DialogButton
      text={text}
      onClick={onClick}
      disabled={disabled}
      color="inherit"
      default={default_}
    />
  );
};

const DialogInner: React.FC<
  React.PropsWithChildren<{
    fullscreen: boolean;
    draggable: boolean;
    pos: { x: number; y: number };
    close: (ret: DialogResult) => Promise<boolean>;
  }>
> = ({ fullscreen, draggable, pos, close, children }) => {
  const reject = useCallback(() => void close({ result: "rejected" }), [close]);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "__dialogbody__",
    disabled: !draggable
  });

  const innerState = useMemo(
    () => ({
      fullscreen,
      draggable,
      attributes,
      listeners,
      close
    }),
    [fullscreen, draggable, attributes, listeners, close]
  );

  const style = useMemo<CSSProperties>(
    () => ({
      transform: `translate3d(${(transform?.x ?? 0) + pos.x}px, ${(transform?.y ?? 0) + pos.y}px, 0)`
    }),
    [transform, pos]
  );

  return (
    <innerCtx.Provider value={innerState}>
      <Paper
        ref={setNodeRef}
        style={style}
        className={classNames("relative flex-col-nowrap p-0", fullscreen && "w-screen h-screen")}
        elevation={6}
      >
        <IconButton className="absolute top-1 right-1" onClick={reject} size="medium">
          <Icon icon="mdi:close" />
        </IconButton>
        {children}
      </Paper>
    </innerCtx.Provider>
  );
};

const Dialog_: React.ForwardRefRenderFunction<DialogMethods> = (_props, outerRef) => {
  const [{ content, defaultActionKey, fullscreen, onBeforeClose }, setProps] =
    useState<DialogProps>(defaultProps);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDialogElement>(null);
  const [, setStatus, statusRef] = useStateWithRef<"opened" | "closed" | "disposed">("disposed");

  const draggable = !fullscreen;

  const close = useCallback(
    async (ret: DialogResult) => {
      if (!onBeforeClose || (await onBeforeClose(ret))) {
        ref.current?.close(dialogResultToReturnValue(ret));
        return true;
      } else {
        return false;
      }
    },
    [onBeforeClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void close({ result: "rejected" });
      } else {
        e.stopPropagation();
      }
    },
    [close]
  );

  const handleKeyDownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (!defaultActionKey || e.nativeEvent.isComposing) {
        return;
      }
      if (!isDefaultActionKeyEvent(e, defaultActionKey)) {
        return;
      }
      const dlg = ref.current;
      if (!dlg) {
        return;
      }
      const button = dlg.querySelector<HTMLButtonElement>("button.__default");
      button?.click();
    },
    [defaultActionKey]
  );

  const dispose = useCallback(() => {
    if (statusRef.current === "closed") {
      setProps(defaultProps);
      statusRef.current = "disposed";
    }
  }, []);

  const methods = useMemo<DialogMethods>(() => {
    return {
      showModal: async (p) => {
        const dlg = ref.current;
        if (!dlg || statusRef.current === "opened") {
          return Promise.resolve({ result: "notready" });
        }
        setPos({ x: 0, y: 0 });
        setStatus("opened");
        setProps(p);
        await wait(0); // rerender dialog with new props
        dlg.returnValue = "";
        dlg.showModal();
        const button = dlg.querySelector<HTMLButtonElement>(".__default");
        button?.focus();
        return new Promise<DialogResult>((resolve) => {
          const handleClose = () => {
            setStatus("closed");
            resolve(returnValueToDialogResult(dlg.returnValue));
            setTimeout(dispose, 500); // dispose after tansition
          };
          dlg.addEventListener("close", handleClose, { once: true });
        });
      }
    };
  }, [dispose]);

  useImperativeHandle(outerRef, () => methods, [methods]);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setPos(({ x, y }) => ({ x: x + e.delta.x, y: y + e.delta.y }));
  }, []);
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <dialog
        ref={ref}
        className={classNames(
          "overflow-visible bg-inherit min-w-96 text-xl backdrop:bg-backdrop m-auto translate-x-0 translate-y-0",
          fullscreen && "m-0"
        )}
        onKeyDown={handleKeyDown}
        onKeyDownCapture={handleKeyDownCapture}
      >
        <DialogInner fullscreen={fullscreen ?? false} draggable={draggable} pos={pos} close={close}>
          {content}
        </DialogInner>
      </dialog>
    </DndContext>
  );
};
export const Dialog = forwardRef(Dialog_);

export const useCloseDialog = () => useContext(innerCtx).close;
