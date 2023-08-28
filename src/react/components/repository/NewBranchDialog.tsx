import { useDispatch, useSelector } from "@/store";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogActionHandler } from "../Dialog";
import { CLOSE_DIALOG } from "@/store/repository";
import { CREATE_BRANCH } from "@/store/thunk/branch";
import { DialogBody } from "../DialogBody";

export const NewBranchDialog: React.FC = () => {
  const dispatch = useDispatch();
  const commitId = useSelector((state) =>
    state.repository.activeDialog?.type === "NewBranch"
      ? state.repository.activeDialog.commitId
      : undefined
  );
  const opened = !!commitId;
  const branchNameRef = useRef<HTMLInputElement>(null);
  const switchRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => dispatch(CLOSE_DIALOG()), [dispatch]);

  useEffect(() => {
    if (opened) {
      setTimeout(() => branchNameRef.current?.focus(), 0);
    }
  }, [opened]);

  const invokeNewBranch = useCallback(async () => {
    if (!commitId || !branchNameRef.current) {
      return;
    }
    const branchName = branchNameRef.current.value;
    const switchBranch = switchRef.current?.checked || false;
    const ret = await dispatch(CREATE_BRANCH({ branchName, switch: switchBranch, commitId }));
    if (ret !== "failed") {
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
    <Dialog className="w-[40rem] max-w-none" draggable opened={opened}>
      <DialogBody title="Create branch" draggable close={close} actions={actions}>
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
    </Dialog>
  );
};
