import { TextField } from "@mui/material";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAlert } from "@/core/context/AlertContext";
import { useCommit } from "@/features/repository/hooks/actions/workingtree";
import { repoPathAtom } from "@/features/repository/state";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  LabelledCheckBox
} from "@/shared/components/ui/Dialog";
import { useTauriQueryInvoke } from "@/shared/hooks/integration/useTauriQuery";
import { clamp } from "@/util";

export const CommitDialogBody: React.FC = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const messageRef = useRef<HTMLInputElement | null>(null);
  const amendRef = useRef<HTMLInputElement | null>(null);
  const { reportError } = useAlert();
  const [rows, setRows] = useState(6);

  const fetchTauriQuery = useTauriQueryInvoke();

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
        const commitDetail = await fetchTauriQuery("get_commit_detail", {
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
    [reportError, repoPath, handleChange, fetchTauriQuery]
  );
  return (
    <>
      <DialogTitle>Commit</DialogTitle>
      <DialogContent>
        <div className="flex-col-nowrap min-w-3xl">
          <TextField
            inputRef={messageRef}
            className="h-auto w-full"
            rows={rows}
            multiline
            label="Commit message"
            placeholder="Input commit message"
            onChange={handleChange}
            slotProps={{
              inputLabel: { shrink: true }
            }}
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
