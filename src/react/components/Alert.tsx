import { IconButton, Slide, Snackbar, SnackbarContent, Typography } from "@material-ui/core";
import SuccessIcon from "@material-ui/icons/CheckCircleOutlineOutlined";
import WarningIcon from "@material-ui/icons/ReportProblemOutlined";
import ErrorIcon from "@material-ui/icons/ErrorOutlineOutlined";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import CloseIcon from "@material-ui/icons/Close";
import { memo, useEffect, useState } from "react";
import { assertNever } from "@/util";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { AlertType } from "@/context/AlertContext";

const Transition = (props: TransitionProps) => <Slide {...props} direction="up" />;

const Icon: React.VFC<{ type: AlertType }> = (props) => {
  switch (props.type) {
    case "success":
      return <SuccessIcon />;
    case "warning":
      return <WarningIcon />;
    case "error":
      return <ErrorIcon />;
    case "info":
      return <InfoIcon />;
    default:
      return assertNever(props.type);
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

const Alert: React.VFC<{
  open: boolean;
  onClose?: (e: React.SyntheticEvent | React.MouseEvent, reason?: string) => void;
  message: string;
  type: AlertType;
}> = (props) => {
  const [type, setType] = useState("info" as AlertType);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (props.open) {
      setType(props.type);
      setMessage(props.message);
    } else {
      // keep type and message while closing.
    }
  });
  return (
    <Snackbar
      className="max-w-[95%]"
      open={props.open}
      onClose={props.onClose}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      TransitionComponent={Transition}
      autoHideDuration={5000}
    >
      <SnackbarContent
        classes={{ root: bg[type], message: "flex text-white" }}
        message={
          <>
            <Icon type={type} />
            <Typography className="ml-4" variant="body1">
              {message}
            </Typography>
          </>
        }
        action={
          <IconButton size="small" onClick={props.onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Snackbar>
  );
};

export default memo(Alert);
