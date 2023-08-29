import { useCallback, useMemo } from "react";
import { Dialog, DialogActionHandler } from "./Dialog";
import { DialogBody } from "./DialogBody";

interface ConfirmDialogProps {
  opened: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose: (accepted: boolean) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  opened,
  title,
  content,
  onClose
}) => {
  const handleCancel = useCallback(() => {
    onClose(false);
  }, [onClose]);
  const actions = useMemo<DialogActionHandler[]>(
    () => [
      {
        text: "OK",
        color: "primary",
        default: true,
        onClick: () => onClose(true)
      }
    ],
    [onClose]
  );
  return (
    <Dialog className="min-w-[32%] max-w-[60%] px-0" opened={opened} close={handleCancel} draggable>
      <DialogBody title={title} actions={actions} focusDefaultButton>
        <div className="py-2 pl-2 pr-8">{content}</div>
      </DialogBody>
    </Dialog>
  );
};
