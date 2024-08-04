import { Slide, SlideProps } from "@mui/material";
import { forwardRef, Ref } from "react";
import { Dialog, DialogActionHandler } from "./Dialog";
import { DialogBody, DialogBodyProps } from "./DialogBody";

export type FullscreenDialogProps = React.PropsWithChildren<{
  title: string;
  opened: boolean;
  close: () => void;
  actions?: readonly DialogActionHandler[];
  defaultActionKey?: DialogBodyProps["defaultActionKey"];
}>;

const TransitionInner = (props: SlideProps, ref: Ref<unknown>) => (
  <Slide direction="right" ref={ref} {...props} mountOnEnter unmountOnExit />
);
const Transition = forwardRef(TransitionInner);

export const FullscreenDialog: React.FC<FullscreenDialogProps> = ({
  title,
  opened,
  close,
  actions,
  defaultActionKey = "Enter",
  children
}) => {
  return (
    <Dialog opened={opened} close={close} fullScreen TransitionComponent={Transition}>
      <DialogBody
        className="flex-col-nowrap flex-1"
        title={title}
        actions={actions}
        defaultActionKey={defaultActionKey}
      >
        {children}
      </DialogBody>
    </Dialog>
  );
};
