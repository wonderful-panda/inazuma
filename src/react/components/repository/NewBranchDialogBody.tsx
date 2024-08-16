import { AcceptButton, CancelButton, DialogContent, DialogTitle } from "@/context/DialogContext";
import { useCreateBranch } from "@/hooks/actions/branch";
import { Checkbox, DialogActions, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";

export const NewBranchDialogBody: React.FC<{ commitId: string }> = ({ commitId }) => {
  const branchNameRef = useRef<HTMLInputElement>(null);
  const switchRef = useRef<HTMLInputElement>(null);
  const forceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => branchNameRef.current?.focus(), 0);
  }, []);

  const createBranch = useCreateBranch();

  const invokeNewBranch = useCallback(async () => {
    if (!branchNameRef.current) {
      return "failed";
    }
    const opt: CreateBranchOptions = {
      commitId,
      branchName: branchNameRef.current.value,
      switch: switchRef.current?.checked ?? false,
      force: forceRef.current?.checked ?? false
    };
    return await createBranch(opt);
  }, [commitId, createBranch]);

  return (
    <>
      <DialogTitle>Create new branch</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={branchNameRef}
          className="h-auto w-full"
          label="New branch name"
          InputLabelProps={{ shrink: true }}
          placeholder="New branch name"
        />
        <FormControlLabel
          control={<Checkbox inputRef={switchRef} />}
          label="Switch to created branch"
        />
        <FormControlLabel
          control={<Checkbox inputRef={forceRef} />}
          label="Move branch if exists (force)"
        />
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeNewBranch} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
