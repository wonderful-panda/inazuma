import { useCallback, useRef } from "react";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogSection,
  DialogTitle,
  LabelledCheckBox
} from "@/components/Dialog";
import { useAlert } from "@/context/AlertContext";
import { useDeleteBranch } from "@/hooks/actions/branch";
import { Icon } from "../Icon";

export const DeleteBranchDialogBody: React.FC<{ branchName: string }> = ({ branchName }) => {
  const forceRef = useRef<HTMLInputElement | null>(null);
  const { showWarning } = useAlert();
  const deleteBranch = useDeleteBranch();
  const invokeDeleteBranch = useCallback(async () => {
    if (!branchName) {
      showWarning("Branch name is not specified");
      return "failed";
    }
    const force = forceRef.current?.checked ?? false;
    return await deleteBranch({ branchName, force });
  }, [branchName, deleteBranch, showWarning]);

  return (
    <>
      <DialogTitle>Delete branch</DialogTitle>
      <DialogContent>
        <div className="flex-col-nowrap w-xl">
          <DialogSection label="Branch name">
            <div className="flex-row-nowrap">
              <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
              {branchName}
            </div>
          </DialogSection>
          <DialogSection label="Options">
            <LabelledCheckBox
              label="Delete branch even if not merged in upstream (--force)"
              inputRef={forceRef}
            />
          </DialogSection>
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeDeleteBranch} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
