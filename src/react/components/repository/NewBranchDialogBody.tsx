import { useDispatch } from "@/store";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { DialogActionHandler } from "../Dialog";
import { CREATE_BRANCH } from "@/store/thunk/branch";
import { DialogBody } from "../DialogBody";
import { CLOSE_DIALOG } from "@/store/thunk/dialog";

export const NewBranchDialogBody: React.FC<{
  commitId: string;
}> = ({ commitId }) => {
  const dispatch = useDispatch();
  const branchNameRef = useRef<HTMLInputElement>(null);
  const switchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => branchNameRef.current?.focus(), 0);
  }, []);

  const invokeNewBranch = useCallback(async () => {
    if (!commitId || !branchNameRef.current) {
      return;
    }
    const branchName = branchNameRef.current.value;
    const switchBranch = switchRef.current?.checked || false;
    const ret = await dispatch(CREATE_BRANCH({ branchName, switch: switchBranch, commitId }));
    if (ret !== "failed" && ret) {
      dispatch(CLOSE_DIALOG());
    }
  }, [dispatch, commitId]);
  const actions = useMemo<DialogActionHandler[]>(
    () => [
      {
        text: "Create Branch",
        color: "primary",
        default: true,
        onClick: invokeNewBranch
      }
    ],
    [invokeNewBranch]
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.ctrlKey && e.code === "Enter") {
        invokeNewBranch();
      }
    },
    [invokeNewBranch]
  );
  return (
    <DialogBody title="Create branch" actions={actions} defaultActionKey="Enter">
      <TextField
        inputRef={branchNameRef}
        className="h-auto w-full"
        label="New branch name"
        InputLabelProps={{ shrink: true }}
        placeholder="New branch name"
        onKeyDown={handleKeyDown}
      />
      <FormControlLabel
        control={<Checkbox inputRef={switchRef} />}
        label="Switch to created branch"
      />
    </DialogBody>
  );
};
