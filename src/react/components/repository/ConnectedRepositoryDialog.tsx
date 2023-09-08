import { useMemo } from "react";
import { Dialog } from "../Dialog";
import { CommitDialogBody } from "./CommitDialogBody";
import { NewBranchDialogBody } from "./NewBranchDialogBody";
import { assertNever } from "@/util";
import { DeleteBranchDialogBody } from "./DeleteBranchDialogBody";
import { useAtomValue, useSetAtom } from "jotai";
import { closeDialogAtom } from "@/state/repository/dialog";
import { activeDialogAtom } from "@/state/repository/premitive";

export const ConnectedRepositoryDialog: React.FC = () => {
  const dialog = useAtomValue(activeDialogAtom);
  const closeDialog = useSetAtom(closeDialogAtom);

  const children = useMemo(() => {
    if (!dialog.param) {
      return <></>;
    }
    switch (dialog.param.type) {
      case "Commit":
        return <CommitDialogBody />;
      case "NewBranch":
        return <NewBranchDialogBody commitId={dialog.param.commitId} />;
      case "DeleteBranch":
        return <DeleteBranchDialogBody branchName={dialog.param.branchName} />;
      default:
        return assertNever(dialog.param);
    }
  }, [dialog]);

  return (
    <Dialog className="max-w-none" draggable opened={!!dialog?.opened} close={closeDialog}>
      {children}
    </Dialog>
  );
};
