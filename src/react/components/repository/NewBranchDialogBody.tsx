import { useDispatch } from "@/store";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { DialogActionHandler } from "../Dialog";
import { CREATE_BRANCH } from "@/store/thunk/branch";
import { DialogBody } from "../DialogBody";

export const NewBranchDialogBody: React.FC<{
  commitId: string;
}> = ({ commitId }) => {
  const dispatch = useDispatch();
  const branchNameRef = useRef<HTMLInputElement>(null);
  const switchRef = useRef<HTMLInputElement>(null);
  const forceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => branchNameRef.current?.focus(), 0);
  }, []);

  const invokeNewBranch = useCallback(
    async (close: () => void) => {
      if (!commitId || !branchNameRef.current) {
        return;
      }
      const branchName = branchNameRef.current.value;
      const switchBranch = switchRef.current?.checked || false;
      const force = forceRef.current?.checked || false;
      const ret = await dispatch(
        CREATE_BRANCH({ branchName, switch: switchBranch, commitId, force })
      );
      if (ret !== "failed" && ret) {
        close();
      }
    },
    [dispatch, commitId]
  );
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
  return (
    <DialogBody title="Create branch" actions={actions} defaultActionKey="Enter">
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
    </DialogBody>
  );
};
