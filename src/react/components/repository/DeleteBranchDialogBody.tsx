import { useAlert } from "@/context/AlertContext";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@/components/Dialog";
import { useDeleteBranch } from "@/hooks/actions/branch";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useCallback, useRef } from "react";
import { Icon } from "../Icon";

export const DeleteBranchDialogBody: React.FC<{ branchName: string }> = ({ branchName }) => {
  const forceRef = useRef<HTMLInputElement>(null);
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
        <div className="flex-col-nowrap w-[36rem]">
          <div className="text-primary">Branch name</div>
          <div className="ml-6 mb-2 px-2 flex-row-nowrap">
            <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
            {branchName}
          </div>
          <div className="text-primary">Options</div>
          <FormControlLabel
            className="ml-6"
            control={<Checkbox inputRef={forceRef} />}
            label="Delete branch even if not merged in upstream (--force)"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeDeleteBranch} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
