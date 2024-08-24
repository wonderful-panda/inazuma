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
  }, [branchName, forceRef, deleteBranch, showWarning]);

  return (
    <>
      <DialogTitle>Delete branch</DialogTitle>
      <DialogContent>
        <div className="flex-col-nowrap w-[40rem]">
          <div className="text-xl my-2">{`Delete branch [${branchName}]`}</div>
          <FormControlLabel
            className="ml-2"
            control={<Checkbox inputRef={forceRef} />}
            label="Force delete"
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
