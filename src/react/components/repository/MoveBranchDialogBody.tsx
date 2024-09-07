import { AcceptButton, CancelButton, DialogContent, DialogTitle } from "@/components/Dialog";
import { DialogActions } from "@mui/material";
import { Icon } from "../Icon";
import { CommitAttributes } from "./CommitAttributes";
import { useAlert } from "@/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "@/hooks/useCallbackWithErrorHandler";
import { useCreateBranch } from "@/hooks/actions/branch";

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
        <div className="m-0 flex flex-col-nowrap w-[44rem]">
          <div className="text-primary">Target branch</div>
          <div className="ml-6 mb-2 px-2 flex-row-nowrap">
            <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
            <span>{branchName}</span>
          </div>
          <div className="text-primary">Move to</div>
          <div className="ml-6 mb-3 px-2 border border-greytext">
            <CommitAttributes commit={destination} showSummary />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeMove} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
