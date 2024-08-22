import { useStateWithRef } from "@/hooks/useStateWithRef";
import { assertNever, nope, wait } from "@/util";
import { Icon } from "@iconify/react";
import { Button, IconButton, Paper } from "@mui/material";
import classNames from "classnames";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import Draggable from "react-draggable";

export interface DialogAction {
  text: string;
  color?: React.ComponentProps<typeof Button>["color"];
  onClick: (close: (ret: DialogResult) => void) => unknown;
  default?: boolean;
}

export const cancelAction = (opt?: { text?: string; default?: boolean }): DialogAction => ({
  text: opt?.text ?? "Cancel",
  color: "inherit",
  onClick: (close) => close({ result: "rejected" }),
  default: opt?.default
});

export interface DialogProps {
  content: React.ReactNode;
  fullscreen?: boolean;
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

const defaultMethods: DialogMethods = {
  showModal: () => Promise.resolve({ result: "notready" })
};
const ctx = createContext<DialogMethods>(defaultMethods);

export const useDialog = () => useContext(ctx);

const innerCtx = createContext<{
  fullscreen: boolean;
  draggable: boolean;
  close: (ret: DialogResult) => void;
}>({
  fullscreen: false,
  draggable: false,
  close: nope
});

export const DialogTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { draggable } = useContext(innerCtx);
  return (
    <div
      className={classNames(
        "px-4 pb-2 border-b border-highlight pt-3",
        draggable && "drag-handle cursor-move"
      )}
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

export const DialogActions: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex-row-nowrap my-2">
    <div className="flex-1" />
    {children}
  </div>
);

export const DialogButton: React.FC<DialogAction> = ({
  text,
  color,
  onClick,
  default: default_
}) => {
  const { close } = useContext(innerCtx);
  const handleClick = useCallback(() => onClick(close), [onClick, close]);
  return (
    <Button
      className={classNames("mr-4 text-xl", default_ && "__default")}
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
  default?: boolean;
}> = ({ text = "OK", onClick, default: default_ }) => {
  const handleClick = useCallback(
    async (close: (ret: DialogResult) => void) => {
      const ret = await onClick();
      if (ret && ret !== "failed") {
        close({ result: "accepted" });
      }
    },
    [onClick]
  );
  return <DialogButton text={text} onClick={handleClick} color="primary" default={default_} />;
};

export const CancelButton: React.FC<{ text?: string; default?: boolean }> = ({
  text = "Cancel",
  default: default_
}) => {
  const onClick = useCallback(
    (close: (ret: DialogResult) => void) => close({ result: "rejected" }),
    []
  );
  return <DialogButton text={text} onClick={onClick} color="inherit" default={default_} />;
};

const Dialog_: React.ForwardRefRenderFunction<DialogMethods> = (_props, outerRef) => {
  const [{ content, defaultActionKey, fullscreen }, setProps] = useState<DialogProps>(defaultProps);
  const ref = useRef<HTMLDialogElement>(null);
  const [, setStatus, statusRef] = useStateWithRef<"opened" | "closed" | "disposed">("disposed");

  const draggable = !fullscreen;
  const innerState = useMemo(
    () => ({
      fullscreen: fullscreen ?? false,
      draggable,
      close: (ret: DialogResult) => {
        ref.current?.close(dialogResultToReturnValue(ret));
      }
    }),
    [fullscreen, draggable]
  );

  const reject = useCallback(() => {
    ref.current?.close();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Esc") {
      e.stopPropagation();
    }
  }, []);

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
  }, [setProps, statusRef]);

  const methods = useMemo<DialogMethods>(() => {
    return {
      showModal: async (p) => {
        const dlg = ref.current;
        if (!dlg || statusRef.current === "opened") {
          return Promise.resolve({ result: "notready" });
        }
        setStatus("opened");
        setProps(p);
        await wait(0); // rerender dialog with new props
        dlg.returnValue = "";
        dlg.showModal();
        const button = dlg.querySelector<HTMLButtonElement>(".__default");
        button?.focus();
        return new Promise<DialogResult>((resolve) => {
          const handleClose = () => {
            dlg.removeEventListener("close", handleClose);
            setStatus("closed");
            resolve(returnValueToDialogResult(dlg.returnValue));
            setTimeout(dispose, 500); // dispose after tansition
          };
          dlg.addEventListener("close", handleClose);
        });
      }
    };
  }, [setProps, setStatus, statusRef, dispose]);

  useImperativeHandle(outerRef, () => methods, [methods]);

  return (
    <innerCtx.Provider value={innerState}>
      <Draggable handle=".drag-handle" disabled={!draggable}>
        <dialog
          ref={ref}
          className={classNames(
            "overflow-visible bg-inherit min-w-96 text-xl backdrop:bg-backdrop",
            fullscreen && "m-0"
          )}
          onKeyDown={handleKeyDown}
          onKeyDownCapture={handleKeyDownCapture}
        >
          <Paper
            className={classNames(
              "relative flex-col-nowrap p-0",
              fullscreen && "w-screen h-screen"
            )}
            elevation={6}
          >
            <IconButton className="absolute top-1 right-1" onClick={reject} size="medium">
              <Icon icon="mdi:close" />
            </IconButton>
            {content}
          </Paper>
        </dialog>
      </Draggable>
    </innerCtx.Provider>
  );
};
export const Dialog = forwardRef(Dialog_);

export const DialogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<DialogMethods>(null);
  const methods = useMemo<DialogMethods>(
    () => ({
      showModal: (p) => (ref.current ?? defaultMethods).showModal(p)
    }),
    []
  );
  return (
    <ctx.Provider value={methods}>
      <div className="flex flex-1">
        <Dialog ref={ref} />
        {children}
      </div>
    </ctx.Provider>
  );
};
