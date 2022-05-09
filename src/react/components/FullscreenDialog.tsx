import { Slide, SlideProps } from "@mui/material";
import { forwardRef } from "react";
import { Dialog, DialogActionHandler } from "./Dialog";

export interface FullscreenDialogProps extends ChildrenProp {
  title: string;
  opened: boolean;
  close: () => void;
  actions?: readonly DialogActionHandler[];
}

const TransitionInner = (props: SlideProps, ref: any) => (
  <Slide direction="right" ref={ref} {...props} mountOnEnter unmountOnExit />
);
const Transition = forwardRef(TransitionInner);

export const FullscreenDialog: React.FC<FullscreenDialogProps> = (props) => {
  return <Dialog {...props} fullScreen TransitionComponent={Transition} />;
};
