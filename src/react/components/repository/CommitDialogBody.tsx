import { clamp } from "@/util";
import { TextField } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";
import { useCommit } from "@/hooks/actions/workingtree";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  LabelledCheckBox
} from "@/components/Dialog";
import { useAlert } from "@/context/AlertContext";

export const CommitDialogBody: React.FC = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const messageRef = useRef<HTMLInputElement | null>(null);
  const amendRef = useRef<HTMLInputElement | null>(null);
  const { reportError } = useAlert();
  const [rows, setRows] = useState(6);

  const commit = useCommit();

  const invokeCommit = useCallback(async () => {
    if (!messageRef.current) {
      return "failed";
    }
    const opt: CommitOptions = {
      commitType: amendRef.current?.checked ? "amend" : "normal",
      message: messageRef.current.value ?? ""
    };
    return await commit(opt);
  }, [commit]);

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
        messageRef.current.value =
          commitDetail.summary + (commitDetail.body ? `\n\n${commitDetail.body}` : "");
        handleChange();
      } catch (error) {
        reportError({ error });
      }
    },
    [reportError, repoPath, handleChange]
  );
  return (
    <>
      <DialogTitle>Commit</DialogTitle>
      <DialogContent>
        <div className="flex-col-nowrap min-w-[48rem]">
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
          <LabelledCheckBox
            label="Amend last commit"
            inputRef={amendRef}
            onChange={handleAmendChange as VoidReturn<typeof handleAmendChange>}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeCommit} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
