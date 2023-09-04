import { ConfirmDialog } from "./ConfirmDialog";
import { useCloseConfirmDialog, useConfirmDialogValue } from "@/state/root";

export const ConnectedConfirmDialog: React.FC = () => {
  const confirmDialog = useConfirmDialogValue();
  const handleClose = useCloseConfirmDialog();

  return (
    <ConfirmDialog
      opened={confirmDialog.status === "open"}
      title={confirmDialog.title}
      content={<span className="text-xl">{confirmDialog.content}</span>}
      onClose={handleClose}
    />
  );
};
