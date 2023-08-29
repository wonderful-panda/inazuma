import { useDispatch, useSelector } from "@/store";
import { useCallback, useMemo } from "react";
import { Dialog } from "../Dialog";
import { CLOSE_DIALOG } from "@/store/repository";
import { CommitDialogBody } from "./CommitDialogBody";
import { NewBranchDialogBody } from "./NewBranchDialogBody";
import { assertNever } from "@/util";

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
      default:
        return assertNever(dialog);
    }
  }, [dialog]);

  return (
    <Dialog className="max-w-none" draggable opened={!!dialog} close={close}>
      {children}
    </Dialog>
  );
};
