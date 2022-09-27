import { useDispatch, useSelector } from "@/store";
import { clamp } from "@/util";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogActionHandler } from "../Dialog";
import { COMMIT } from "@/store/thunk/commit";
import { CLOSE_DIALOG } from "@/store/repository";
import { REPORT_ERROR } from "@/store/misc";
import { invokeTauriCommand } from "@/invokeTauriCommand";

export const CommitDialog: React.FC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const opened = useSelector((state) => state.repository.activeDialog === "commit");
  const messageRef = useRef<HTMLInputElement>(null);
  const amendRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState(6);
  const close = useCallback(() => dispatch(CLOSE_DIALOG()), [dispatch]);

  useEffect(() => {
    if (opened) {
      setRows(6);
      setTimeout(() => messageRef.current?.focus(), 0);
    }
  }, [opened]);

  const handleChange = useCallback(() => {
    if (messageRef.current) {
      setRows(clamp(messageRef.current.value.split(/\n/g).length, 6, 24));
    }
  }, []);
  const handleAmendChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!repoPath) {
        throw new Error("repoPath is empty!");
      }
      if (!messageRef.current || !e.target.checked) {
        return;
      }
      try {
        // get commit message of HEAD and set it to TextArea.
        const commitDetail = await invokeTauriCommand("get_commit_detail", {
          repoPath,
          revspec: "HEAD"
        });
        // always true
        messageRef.current.value =
          commitDetail.summary + (commitDetail.body ? "\n\n" + commitDetail.body : "");
        handleChange();
      } catch (error) {
        dispatch(REPORT_ERROR({ error }));
      }
    },
    [dispatch, repoPath, handleChange]
  );
  const invokeCommit = useCallback(async () => {
    if (!amendRef.current) {
      return;
    }
    const message = messageRef.current?.value || "";
    const options: CommitOptions = {
      commitType: amendRef.current.checked ? "amend" : "normal",
      message
    };
    const ret = await dispatch(COMMIT(options));
    if (ret !== "failed" && ret) {
      dispatch(CLOSE_DIALOG());
    }
  }, [dispatch]);
  const actions = useMemo<DialogActionHandler[]>(
    () => [
      {
        text: "Commit",
        color: "primary",
        default: true,
        onClick: invokeCommit
      }
    ],
    [invokeCommit]
  );
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.ctrlKey && e.code === "Enter") {
        invokeCommit();
      }
    },
    [invokeCommit]
  );
  return (
    <Dialog
      className="w-[60rem] max-w-none"
      title="Commit"
      opened={opened}
      close={close}
      actions={actions}
    >
      <TextField
        inputRef={messageRef}
        className="h-auto w-full"
        rows={rows}
        multiline
        label="Commit message"
        InputLabelProps={{ shrink: true }}
        placeholder="Input commit message"
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <FormControlLabel
        control={<Checkbox inputRef={amendRef} onChange={handleAmendChange} />}
        label="amend last commit"
      />
    </Dialog>
  );
};
