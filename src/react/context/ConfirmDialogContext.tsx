import { useStateWithRef } from "@/hooks/useStateWithRef";
import { Icon } from "@iconify/react";
import { Button, IconButton, Paper } from "@mui/material";
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

export interface ConfirmDialogProps {
  title: string;
  content: React.ReactNode;
  buttons?: [string, string];
  defaultButton?: "accept" | "reject";
}

const defaultProps: ConfirmDialogProps = {
  title: "",
  content: <></>
};

export type ConfirmDialogResult = "accepted" | "rejected" | "notready";

export interface ConfirmDialogMethods {
  showModal: (props: ConfirmDialogProps) => Promise<ConfirmDialogResult>;
}

const ConfirmDialogContext = createContext<ConfirmDialogMethods>({
  showModal: () => Promise.resolve("rejected")
});

export const useConfirmDialog = () => useContext(ConfirmDialogContext);

const Dialog_: React.ForwardRefRenderFunction<
  HTMLDialogElement,
  Omit<ConfirmDialogProps, "defaultButton">
> = ({ title, content, buttons = ["OK", "Cancel"] }, outerRef) => {
  const ref = useRef<HTMLDialogElement>(null);

  const accept = useCallback(() => {
    ref.current?.close("accept");
  }, []);

  const reject = useCallback(() => {
    ref.current?.close();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Esc") {
      e.stopPropagation();
    }
  }, []);

  useImperativeHandle(outerRef, () => ref.current!);

  return (
    <Draggable handle=".drag-handle">
      <dialog
        ref={ref}
        className="overflow-visible bg-inherit min-w-96 text-xl"
        onKeyDown={handleKeyDown}
      >
        <Paper className="relative flex-col-nowrap pt-4 pb-2" elevation={2}>
          <IconButton className="absolute top-1 right-1" onClick={reject} size="medium">
            <Icon icon="mdi:close" />
          </IconButton>
          <div className="drag-handle cursor-move px-4 pb-2 border-b border-highlight">{title}</div>
          <div className="p-4 text-lg border-b border-highlight">{content}</div>
          <div className="flex-row-nowrap mt-2">
            <div className="flex-1" />
            <Button key="1" className="mr-4 text-xl _accept" onClick={accept} color="primary">
              {buttons[0]}
            </Button>
            <Button key="2" className="mr-4 text-xl _reject" onClick={reject} color="inherit">
              {buttons[1]}
            </Button>
          </div>
        </Paper>
      </dialog>
    </Draggable>
  );
};
const Dialog = forwardRef(Dialog_);

export const ConfirmDialogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [props, setProps] = useState<ConfirmDialogProps>(defaultProps);
  const ref = useRef<HTMLDialogElement>(null);
  const [, setStatus, statusRef] = useStateWithRef<"opened" | "closed" | "disposed">("disposed");

  const dispose = useCallback(() => {
    if (statusRef.current === "closed") {
      setProps(defaultProps);
      statusRef.current = "disposed";
    }
  }, [setProps, statusRef]);

  const methods = useMemo<ConfirmDialogMethods>(() => {
    return {
      showModal: async (p) => {
        const dlg = ref.current;
        if (!dlg || statusRef.current === "opened") {
          return Promise.resolve("notready");
        }
        setStatus("opened");
        setProps(p);
        dlg.returnValue = "";
        dlg.showModal();
        const button = dlg.querySelector<HTMLButtonElement>(
          p.defaultButton === "reject" ? "button._reject" : "button._accept"
        )!;
        button.focus();
        return new Promise<ConfirmDialogResult>((resolve) => {
          const handleClose = () => {
            dlg.removeEventListener("close", handleClose);
            setStatus("closed");
            resolve(dlg.returnValue === "accept" ? "accepted" : "rejected");
            setTimeout(dispose, 500); // dispose after tansition
          };
          dlg.addEventListener("close", handleClose);
        });
      }
    };
  }, [setProps, setStatus, statusRef, dispose]);

  return (
    <ConfirmDialogContext.Provider value={methods}>
      <div className="flex flex-1">
        <Dialog ref={ref} {...props} />
        {children}
      </div>
    </ConfirmDialogContext.Provider>
  );
};
