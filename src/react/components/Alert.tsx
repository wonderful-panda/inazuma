import { vname } from "@/cssvar";
import {
  IconButton,
  makeStyles,
  Slide,
  Snackbar,
  SnackbarContent,
  Typography
} from "@material-ui/core";
import SuccessIcon from "@material-ui/icons/CheckCircleOutlineOutlined";
import WarningIcon from "@material-ui/icons/ReportProblemOutlined";
import ErrorIcon from "@material-ui/icons/ErrorOutlineOutlined";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import CloseIcon from "@material-ui/icons/Close";
import { memo, useEffect, useState } from "react";
import { assertNever } from "@/util";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { AlertType } from "@/context/AlertContext";

const Transition = (props: TransitionProps) => <Slide {...props} direction="up" />;

const contentStyle = <T extends AlertType>(type: T): Record<T, CSSProperties> =>
  ({
    [type]: { backgroundColor: `var(${vname(type)})` }
  } as Record<T, CSSProperties>);

const useStyles = makeStyles({
  root: {
    maxWidth: "95%"
  },
  message: {
    display: "flex",
    color: "white"
  },
  messageText: {
    marginLeft: "1rem"
  },
  ...contentStyle("success"),
  ...contentStyle("warning"),
  ...contentStyle("error"),
  ...contentStyle("info")
});

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

const Alert: React.VFC<{
  open: boolean;
  onClose?: (e: React.SyntheticEvent | React.MouseEvent, reason?: string) => void;
  message: string;
  type: AlertType;
}> = (props) => {
  const classes = useStyles();
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
      classes={{ root: classes.root }}
      open={props.open}
      onClose={props.onClose}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      TransitionComponent={Transition}
      autoHideDuration={5000}
    >
      <SnackbarContent
        classes={{ root: classes[type], message: classes.message }}
        message={
          <>
            <Icon type={type} />
            <Typography classes={{ root: classes.messageText }} variant="body1">
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
