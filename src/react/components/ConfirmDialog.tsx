import { useCallback, useMemo } from "react";
import { Dialog, DialogActionHandler } from "./Dialog";

interface ConfirmDialogProps {
  opened: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose: (accepted: boolean) => void;
}

const ConfirmDialog: React.VFC<ConfirmDialogProps> = ({ opened, title, content, onClose }) => {
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
    <Dialog
      title={title}
      className="min-w-[32%] max-w-[60%] px-0"
      opened={opened}
      actions={actions}
      close={handleCancel}
    >
      <div className="py-2 pl-2 pr-8">{content}</div>
    </Dialog>
  );
};

export default ConfirmDialog;
