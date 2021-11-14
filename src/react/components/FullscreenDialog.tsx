import { Slide } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { forwardRef } from "react";
import { Dialog, DialogActionHandler } from "./Dialog";

export interface FullscreenDialogProps {
  title: string;
  opened: boolean;
  close: () => void;
  actions?: readonly DialogActionHandler[];
}

const TransitionInner = (props: TransitionProps, ref: any) => (
  <Slide direction="right" ref={ref} {...props} mountOnEnter unmountOnExit />
);
const Transition = forwardRef(TransitionInner);

export const FullscreenDialog: React.FC<FullscreenDialogProps> = (props) => {
  return <Dialog {...props} fullScreen TransitionComponent={Transition} />;
};
