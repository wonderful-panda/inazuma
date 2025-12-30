import { DialogActions } from "@mui/material";
import { useAtomValue } from "jotai";
import { useAlert } from "@/core/context/AlertContext";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import { useCreateBranch } from "@/features/repository/hooks/actions/branch";
import { repoPathAtom } from "@/features/repository/state";
import {
  AcceptButton,
  CancelButton,
  DialogContent,
  DialogSection,
  DialogTitle
} from "@/shared/components/ui/Dialog";
import { Icon } from "@/shared/components/ui/Icon";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { CommitAttributes } from "./CommitAttributes";

export const MoveBranchDialogBody: React.FC<{ branchName: string; destination: Commit }> = ({
  branchName,
  destination
}) => {
  const alert = useAlert();
  const repoPath = useAtomValue(repoPathAtom);
  const branch = useCreateBranch();
  const invokeMove = useCallbackWithErrorHandler(async () => {
    const currentBranch = await invokeTauriCommand("get_current_branch", { repoPath });
    if (currentBranch === branchName) {
      alert.showError(`"${branchName}" can't be moved because this is current branch`);
      return false;
    }
    return await branch({ branchName, commitId: destination.id, force: true });
  }, [alert, branch, repoPath, branchName, destination]);

  return (
    <>
      <DialogTitle>Move branch to the specified commit</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-176">
          <DialogSection label="Target branch">
            <div className="flex-row-nowrap">
              <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
              <span>{branchName}</span>
            </div>
          </DialogSection>
          <DialogSection label="Move to">
            <div className="p-2 border border-greytext">
              <CommitAttributes commit={destination} showSummary />
            </div>
          </DialogSection>
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeMove} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
