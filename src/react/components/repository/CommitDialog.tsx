import { useDispatch, useSelector } from "@/store";
import { clamp, serializeError } from "@/util";
import { Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogActionHandler } from "../Dialog";
import { COMMIT } from "@/store/thunk/commit";
import { CLOSE_DIALOG } from "@/store/repository";
import { SHOW_ERROR } from "@/store/misc";
import { dispatchBrowser } from "@/dispatchBrowser";

export const CommitDialog: React.VFC = () => {
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
        const commitDetail = await dispatchBrowser("getLogDetail", { repoPath, sha: "HEAD" });
        if (commitDetail.type === "commit") {
          // always true
          messageRef.current.value =
            commitDetail.summary + (commitDetail.body ? "\n\n" + commitDetail.body : "");
          handleChange();
        }
      } catch (e) {
        dispatch(SHOW_ERROR({ error: serializeError(e) }));
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
      amend: amendRef.current.checked,
      message
    };
    if (await dispatch(COMMIT(options))) {
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
        variant="outlined"
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
