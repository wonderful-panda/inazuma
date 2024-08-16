import { getOverlayDiv } from "@/overlay";
import { Backdrop, CircularProgress, Portal } from "@mui/material";
import classNames from "classnames";

export const Loading: React.FC<{ className?: string; open: boolean }> = ({ className, open }) => {
  return (
    <Backdrop className={classNames("z-9999 absolute bg-backdrop", className)} open={open}>
      <CircularProgress color="primary" size={64} />
    </Backdrop>
  );
};

export const TopLayerLoading: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <Portal container={getOverlayDiv}>
      <Loading className="w-screen h-screen" open={open} />
    </Portal>
  );
};
