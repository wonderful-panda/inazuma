import { useDispatch, useSelector } from "@/store";
import { CLOSE_CONFIRM_DIALOG } from "@/store/thunk/confirmDialog";
import { useCallback } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

export const ConnectedConfirmDialog: React.FC = () => {
  const dispatch = useDispatch();
  const confirmDialog = useSelector((state) => state.confirmDialog);
  const handleClose = useCallback(
    (accepted: boolean) => {
      dispatch(CLOSE_CONFIRM_DIALOG({ accepted }));
    },
    [dispatch]
  );

  return (
    <ConfirmDialog
      opened={confirmDialog.status === "open"}
      title={confirmDialog.title}
      content={<span className="text-xl">{confirmDialog.content}</span>}
      onClose={handleClose}
    />
  );
};
