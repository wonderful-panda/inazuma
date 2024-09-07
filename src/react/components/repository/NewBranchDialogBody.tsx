import { AcceptButton, CancelButton, DialogContent, DialogTitle } from "@/components/Dialog";
import { useCreateBranch } from "@/hooks/actions/branch";
import { Checkbox, DialogActions, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { CommitAttributes } from "./CommitAttributes";
import { Icon } from "../Icon";

export const NewBranchDialogBody: React.FC<{ commit: Commit }> = ({ commit }) => {
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
      commitId: commit.id,
      branchName: branchNameRef.current.value,
      switch: switchRef.current?.checked ?? false,
      force: forceRef.current?.checked ?? false
    };
    return await createBranch(opt);
  }, [commit, createBranch]);

  return (
    <>
      <DialogTitle>Create branch</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[44rem]">
          <div className="text-primary">New branch name</div>
          <div className="ml-6 mb-2 px-2 flex-row-nowrap">
            <Icon icon="mdi:source-branch" className="mr-2 my-auto" />
            <TextField
              inputRef={branchNameRef}
              className="w-80"
              variant="standard"
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <div className="text-primary">Create at</div>
          <div className="ml-6 mb-3 px-2 border border-greytext">
            <CommitAttributes commit={commit} showSummary />
          </div>
          <div className="text-primary">Options</div>
          <FormControlLabel
            className="ml-6 h-8"
            control={<Checkbox inputRef={switchRef} />}
            label="Switch to created branch"
          />
          <FormControlLabel
            className="ml-6 h-8"
            control={<Checkbox inputRef={forceRef} />}
            label="Move branch to this commit if already exists (--force)"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeNewBranch} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
