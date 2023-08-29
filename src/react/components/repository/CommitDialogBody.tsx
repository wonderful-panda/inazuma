import { useDispatch, useSelector } from "@/store";
import { clamp } from "@/util";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DialogActionHandler } from "../Dialog";
import { COMMIT } from "@/store/thunk/commit";
import { REPORT_ERROR } from "@/store/misc";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { DialogBody } from "../DialogBody";

export const CommitDialogBody: React.FC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const messageRef = useRef<HTMLInputElement>(null);
  const amendRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState(6);

  useEffect(() => {
    setRows(6);
    setTimeout(() => messageRef.current?.focus(), 0);
  }, []);

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
  const invokeCommit = useCallback(
    async (close: () => void) => {
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
        close();
      }
    },
    [dispatch]
  );
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
  return (
    <DialogBody
      className="w-[50rem]"
      title="Commit"
      actions={actions}
      defaultActionKey="Ctrl+Enter"
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
      />
      <FormControlLabel
        control={<Checkbox inputRef={amendRef} onChange={handleAmendChange} />}
        label="amend last commit"
      />
    </DialogBody>
  );
};
