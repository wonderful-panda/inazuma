import { IconButton, Snackbar, SnackbarContent, Typography } from "@mui/material";
import { Icon } from "./Icon";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { assertNever, serializeError, wait } from "@/util";
import { IconName } from "@/types/IconName";
import { createPortal } from "react-dom";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useWithRef } from "@/hooks/useWithRef";

const iconName = (type: AlertType): IconName => {
  switch (type) {
    case "success":
      return "mdi:check-circle-outline";
    case "warning":
      return "mdi:alert-outline";
    case "error":
      return "mdi:alert-circle-outline";
    case "info":
      return "mdi:information-outline";
    default:
      return assertNever(type);
  }
};

// tailwindcss classnames must be static literal.
// composed string like `bg-${type}` does not work.
const bg: Record<AlertType, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info"
};

export interface AlertMethods {
  show: (alert: { type: AlertType; message: string }) => void;
  showInfo: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
  reportError: (error: { error: unknown }) => void;
}

const AlertInner: React.FC<{
  open: boolean;
  onClose: (e: React.SyntheticEvent | React.MouseEvent | Event) => void;
  type: AlertType;
  message: string;
}> = ({ open, onClose, type, message }) => {
  const handleCopy = useCallback(() => {
    void invokeTauriCommand("yank_text", { text: message });
  }, [message]);
  return (
    <Snackbar
      className="max-w-[95%] w-max"
      open={open}
      onClose={onClose}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      autoHideDuration={5000}
      ClickAwayListenerProps={{
        mouseEvent: false
      }}
    >
      <SnackbarContent
        classes={{
          root: bg[type],
          message: "flex text-white",
          action: "absolute right-0 mr-2"
        }}
        message={
          <>
            <div className="m-auto text-2xl">
              <Icon icon={iconName(type)} />
            </div>
            <Typography className="ml-4 mr-16" variant="body1">
              {message}
            </Typography>
          </>
        }
        action={
          <>
            <IconButton size="small" onClick={handleCopy} title="Copy text">
              <Icon icon="mdi:content-copy" />
            </IconButton>
            <IconButton size="small" onClick={onClose} title="Close">
              <Icon icon="mdi:close" />
            </IconButton>
          </>
        }
      />
    </Snackbar>
  );
};

const getPortalContainer = () =>
  document.querySelector<HTMLElement>("dialog:modal") ?? document.body;

const Alert_: React.ForwardRefRenderFunction<AlertMethods> = (_, ref) => {
  const [status, setStatus] = useState<"opened" | "closing" | "closed">("closed");
  const [, statusRef] = useWithRef(status);
  const [alert, setAlert] = useState<{ type: AlertType; message: string }>({
    type: "info",
    message: ""
  });
  const [portalContainer, setPortalContainer] = useState<HTMLElement>(document.body);

  const show = useCallback(
    async (alert: { type: AlertType; message: string }) => {
      if (statusRef.current === "opened") {
        setStatus("closed");
      }
      await wait(10); // execute below code after previous alert closed
      const portalContainer = getPortalContainer();
      if (portalContainer instanceof HTMLDialogElement) {
        portalContainer.addEventListener("close", () => setStatus("closed"), { once: true });
      }
      setPortalContainer(portalContainer);
      setStatus("opened");
      setAlert(alert);
    },
    [statusRef]
  );

  const hide = useCallback(() => {
    setStatus((prev) => (prev === "opened" ? "closing" : prev));
    setTimeout(() => {
      setStatus((prev) => (prev === "closing" ? "closed" : prev));
    }, 200);
  }, []);
  useImperativeHandle(ref, () => ({
    show: (alert) => void show(alert),
    showInfo: (message) => void show({ type: "info", message }),
    showSuccess: (message) => void show({ type: "success", message }),
    showWarning: (message) => void show({ type: "warning", message }),
    showError: (message) => void show({ type: "error", message }),
    reportError: ({ error }) => {
      const e = serializeError(error);
      const message = e.name ? `[${e.name}] ${e.message}` : e.message;
      void show({ type: "error", message });
    }
  }));
  return status !== "closed" ? (
    createPortal(
      <AlertInner
        open={status === "opened"}
        onClose={hide}
        type={alert.type}
        message={alert.message}
      />,
      portalContainer
    )
  ) : (
    <></>
  );
};

export const GlobalAlert = forwardRef(Alert_);
