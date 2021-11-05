import { IconButton, Slide, Snackbar, SnackbarContent, Typography } from "@material-ui/core";
import { Icon } from "./Icon";
import { memo, useEffect, useState } from "react";
import { assertNever } from "@/util";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { IconName } from "@/__IconName";

const Transition = (props: TransitionProps) => <Slide {...props} direction="up" />;

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
  }, [props.open, props.type, props.message]);
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
            <div className="m-auto text-2xl">
              <Icon icon={iconName(type)} />
            </div>
            <Typography className="ml-4" variant="body1">
              {message}
            </Typography>
          </>
        }
        action={
          <IconButton size="small" onClick={props.onClose}>
            <Icon icon="mdi:close" />
          </IconButton>
        }
      />
    </Snackbar>
  );
};

export default memo(Alert);
