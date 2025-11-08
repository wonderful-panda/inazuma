import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { CommitDialogBody } from "@/components/repository/CommitDialogBody";
import { useAlert } from "@/context/AlertContext";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { useDialog } from "@/context/DialogContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { repoPathAtom } from "@/state/repository";
import { workingTreeAtom } from "@/state/repository/workingtree";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { useReloadRepository } from "./openRepository";

export const useReloadWorkingTree = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const setWorkingTree = useSetAtom(workingTreeAtom);
  return useCallbackWithErrorHandler(async () => {
    if (!repoPath) {
      return;
    }
    const [stat, user] = await Promise.all([
      invokeTauriCommand("get_workingtree_stat", {
        repoPath
      }),
      invokeTauriCommand("get_user_info", { repoPath })
    ]);
    const files: Record<WorkingTreeFileKind["type"], WorkingTreeFileEntry[]> = {
      unmerged: [],
      unstaged: [],
      staged: []
    };
    for (const file of stat.files) {
      files[file.kind.type].push(file);
    }
    const value: WorkingTreeStat = {
      id: "--",
      author: user.name,
      mailAddress: user.email,
      summary: "<Working tree>",
      date: Date.now(),
      parentIds: stat.parentIds,
      unmergedFiles: files.unmerged,
      unstagedFiles: files.unstaged,
      stagedFiles: files.staged
    };
    setWorkingTree({ repoPath, value });
  }, [repoPath, setWorkingTree]);
};

export const useStage = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadWorkingTree = useReloadWorkingTree();
  return useCallbackWithErrorHandler(
    async (relPaths: string[]) => {
      if (!repoPath) {
        return;
      }
      await invokeTauriCommand("stage", { repoPath, relPaths });
      await reloadWorkingTree();
    },
    [repoPath, reloadWorkingTree]
  );
};

export const useUnstage = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadWorkingTree = useReloadWorkingTree();
  return useCallbackWithErrorHandler(
    async (relPaths: string[]) => {
      if (!repoPath) {
        return;
      }
      await invokeTauriCommand("unstage", { repoPath, relPaths });
      await reloadWorkingTree();
    },
    [repoPath, reloadWorkingTree]
  );
};

export const useRestore = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadWorkingTree = useReloadWorkingTree();
  const confirm = useConfirmDialog();
  return useCallbackWithErrorHandler(
    async (relPaths: string[]) => {
      if (!repoPath) {
        return;
      }
      const ret = await confirm.showModal({
        title: "Restore",
        content: "Discard unstaged changes of selected file(s)",
        defaultButton: "reject"
      });
      if (ret !== "accepted") {
        return;
      }
      await invokeTauriCommand("restore", { repoPath, relPaths });
      await reloadWorkingTree();
    },
    [repoPath, confirm, reloadWorkingTree]
  );
};

export const useBeginCommit = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const dialog = useDialog();
  return useCallbackWithErrorHandler(async () => {
    if (!repoPath) {
      return;
    }
    return await dialog.showModal({
      content: <CommitDialogBody />,
      defaultActionKey: "Ctrl+Enter"
    });
  }, [repoPath, dialog]);
};

export const useCommit = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadRepository = useReloadRepository();
  const { showWarning } = useAlert();
  return useCallbackWithErrorHandler(
    async (options: CommitOptions) => {
      if (options.commitType === "normal" && !options.message) {
        showWarning("Input commit message");
        return false;
      }
      if (!repoPath) {
        return false;
      }
      const stat = await invokeTauriCommand("get_workingtree_stat", { repoPath });
      if (options.commitType === "normal" && stat.files.every((f) => f.kind.type !== "staged")) {
        showWarning("Nothing to commit");
        return false;
      }
      if (stat.files.some((f) => f.statusCode === "U")) {
        showWarning("One or more files are still unmerged");
        return false;
      }
      await invokeTauriCommand("commit", { repoPath, options });
      await reloadRepository();
      return true;
    },
    [repoPath, reloadRepository, showWarning],
    { loading: true }
  );
};

export const useFixup = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const confirm = useConfirmDialog();
  const commit = useCommit();
  return useCallback(async () => {
    if (!repoPath) {
      return;
    }
    const ret = await confirm.showModal({
      title: "Fixup",
      content: "Meld staged changes into last commit without changing message"
    });
    if (ret !== "accepted") {
      return;
    }
    await commit({ commitType: "amend" });
  }, [repoPath, confirm, commit]);
};
