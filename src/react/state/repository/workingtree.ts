import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallbackWithErrorHandler } from "../util";
import { repoPathAtom, workingTreeAtom } from "./premitive";
import { openDialogAtom } from "./dialog";
import { useReloadRepository } from ".";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useShowConfirmDialog, useShowWarning } from "../root";
import { useCallback } from "react";
import { useWithRef } from "@/hooks/useWithRef";

const setWorkingTreeAtom = atom(
  null,
  (get, set, update: { repoPath: string; value: WorkingTreeStat }) => {
    if (get(repoPathAtom) === update.repoPath) {
      set(workingTreeAtom, update.value);
    }
  }
);

export const useReloadWorkingTree = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const setWorkingTree = useSetAtom(setWorkingTreeAtom);
  return useCallbackWithErrorHandler(async () => {
    if (!repoPath) {
      return;
    }
    const stat = await invokeTauriCommand("get_workingtree_stat", {
      repoPath
    });
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
      author: "--",
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
    async (relPath: string) => {
      if (!repoPath) {
        return;
      }
      await invokeTauriCommand("stage", { repoPath, relPath });
      await reloadWorkingTree();
    },
    [repoPath, reloadWorkingTree]
  );
};

export const useUnstage = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadWorkingTree = useReloadWorkingTree();
  return useCallbackWithErrorHandler(
    async (relPath: string) => {
      if (!repoPath) {
        return;
      }
      await invokeTauriCommand("unstage", { repoPath, relPath });
      await reloadWorkingTree();
    },
    [repoPath, reloadWorkingTree]
  );
};

export const useRestore = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadWorkingTree = useReloadWorkingTree();
  const showConfirmDialog = useShowConfirmDialog();
  return useCallbackWithErrorHandler(
    async (relPath: string) => {
      if (!repoPath) {
        return;
      }
      const ret = await showConfirmDialog({
        title: "Restore",
        content: "Discard unstaged changes of selected file"
      });
      if (!ret) {
        return;
      }
      await invokeTauriCommand("restore", { repoPath, relPath });
      await reloadWorkingTree();
    },
    [repoPath, showConfirmDialog, reloadWorkingTree]
  );
};

export const useBeginCommit = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const openDialog = useSetAtom(openDialogAtom);
  return useCallbackWithErrorHandler(() => {
    if (!repoPath) {
      return;
    }
    openDialog({ type: "Commit" });
  }, [repoPath, openDialog]);
};

export const useCommit = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const [, reloadRepository] = useWithRef(useReloadRepository());
  const showWarning = useShowWarning();
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
      reloadRepository.current();
      return true;
    },
    [repoPath, reloadRepository, showWarning],
    { loading: true }
  );
};

export const useFixup = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const showConfirmDialog = useShowConfirmDialog();
  const commit = useCommit();
  return useCallback(async () => {
    if (!repoPath) {
      return;
    }
    const ret = await showConfirmDialog({
      title: "Fixup",
      content: "Meld staged changes into last commit without changing message"
    });
    if (!ret) {
      return;
    }
    await commit({ commitType: "amend" });
  }, [repoPath, showConfirmDialog, commit]);
};
