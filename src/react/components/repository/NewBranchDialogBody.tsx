import {
  AcceptButton,
  CancelButton,
  DialogContent,
  DialogSection,
  DialogTitle,
  LabelledCheckBox
} from "@/components/Dialog";
import { useCreateBranch } from "@/hooks/actions/branch";
import { DialogActions, TextField } from "@mui/material";
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
          <DialogSection label="New branch name">
            <div className="flex-row-nowrap">
              <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
              <TextField
                inputRef={branchNameRef}
                className="w-80"
                variant="standard"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </DialogSection>
          <DialogSection label="Create at">
            <div className="border p-2 border-greytext">
              <CommitAttributes commit={commit} showSummary />
            </div>
          </DialogSection>
          <DialogSection label="Options">
            <LabelledCheckBox inputRef={switchRef} label="Switch to created branch" />
            <LabelledCheckBox
              inputRef={forceRef}
              label="Move branch to this commit if already exists (--force)"
            />
          </DialogSection>
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeNewBranch} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
