import { useDispatch, useSelector } from "@/store";
import { clamp } from "@/util";
import { TextField } from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogActionHandler } from "../Dialog";
import { COMMIT } from "@/store/thunk/commit";
import { CLOSE_DIALOG } from "@/store/repository";

const CommitDialog: React.VFC = () => {
  const dispatch = useDispatch();
  const opened = useSelector((state) => state.repository.activeDialog === "commit");
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState(6);
  const close = useCallback(() => dispatch(CLOSE_DIALOG()), [dispatch]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRows(clamp(e.target.value.split(/\n/g).length, 6, 24));
  }, []);
  useEffect(() => {
    if (opened) {
      setRows(6);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [opened]);
  const invokeCommit = useCallback(async () => {
    const message = inputRef.current?.value || "";
    if (await dispatch(COMMIT(message))) {
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
        inputRef={inputRef}
        className="h-auto w-full"
        rows={rows}
        variant="outlined"
        multiline
        label="Commit message"
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
    </Dialog>
  );
};

export default CommitDialog;
