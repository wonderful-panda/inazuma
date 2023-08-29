import { useDispatch, useSelector } from "@/store";
import { useCallback, useMemo } from "react";
import { Dialog } from "../Dialog";
import { CommitDialogBody } from "./CommitDialogBody";
import { NewBranchDialogBody } from "./NewBranchDialogBody";
import { assertNever } from "@/util";
import { CLOSE_DIALOG } from "@/store/thunk/dialog";
import { DeleteBranchDialogBody } from "./DeleteBranchDialogBody";

export const ConnectedRepositoryDialog: React.FC = () => {
  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.repository.activeDialog);
  const close = useCallback(() => dispatch(CLOSE_DIALOG()), [dispatch]);

  const children = useMemo(() => {
    if (!dialog) {
      return <></>;
    }
    switch (dialog.type) {
      case "Commit":
        return <CommitDialogBody />;
      case "NewBranch":
        return <NewBranchDialogBody commitId={dialog.commitId} />;
      case "DeleteBranch":
        return <DeleteBranchDialogBody branchName={dialog.branchName} />;
      default:
        return assertNever(dialog);
    }
  }, [dialog]);

  return (
    <Dialog className="max-w-none" draggable opened={!!dialog?.opened} close={close}>
      {children}
    </Dialog>
  );
};
