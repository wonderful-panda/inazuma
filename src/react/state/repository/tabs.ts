import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallbackWithErrorHandler } from "../util";
import { RepositoryTab, repoPathAtom, tabsAtom } from "./premitive";
import { getFileName, shortHash } from "@/util";

export const addTabAtom = atom(null, (_get, set, update: RepositoryTab) => {
  set(tabsAtom, (prev) => {
    if (!prev) {
      return prev;
    }
    const index = prev.tabs.findIndex((t) => t.id === update.id);
    if (0 <= index) {
      return { tabs: prev.tabs, currentIndex: index };
    } else {
      return { tabs: [...prev.tabs, update], currentIndex: prev.tabs.length };
    }
  });
});

export const removeTabAtom = atom(null, (_get, set, index?: number) => {
  set(tabsAtom, (prev) => {
    if (!prev) {
      return prev;
    }
    const realIndex = index === undefined ? prev.currentIndex : index;
    if (!prev.tabs[realIndex].closable) {
      return prev;
    }
    const tabs = prev.tabs.filter((_, i) => i !== realIndex);
    let currentIndex;
    if (tabs.length <= prev.currentIndex) {
      currentIndex = tabs.length - 1;
    } else if (realIndex < prev.currentIndex) {
      currentIndex = prev.currentIndex - 1;
    } else {
      currentIndex = prev.currentIndex;
    }
    return { tabs, currentIndex };
  });
});

export const selectTabAtom = atom(null, (_get, set, index: number) => {
  set(tabsAtom, (prev) => {
    if (!prev) {
      return prev;
    } else {
      return { tabs: prev.tabs, currentIndex: index };
    }
  });
});

export const selectNextTabAtom = atom(null, (_get, set) => {
  set(tabsAtom, (prev) => {
    if (!prev || prev.tabs.length === 0) {
      return prev;
    } else {
      const { tabs, currentIndex } = prev;
      return { tabs, currentIndex: (currentIndex + 1) % tabs.length };
    }
  });
});

export const selectPreviousTabAtom = atom(null, (_get, set) => {
  set(tabsAtom, (prev) => {
    if (!prev || prev.tabs.length === 0) {
      return prev;
    } else {
      const { tabs, currentIndex } = prev;
      return { tabs, currentIndex: (currentIndex - 1 + tabs.length) % tabs.length };
    }
  });
});

export const useShowCommitDiff = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addTabAtom);
  return useCallbackWithErrorHandler(
    (commit1: Commit, commit2: Commit) => {
      if (!repoPath) {
        return;
      }
      addTab({
        type: "commitDiff",
        id: `commitDiff:${commit1.id}-${commit2.id}`,
        title: `COMPARE @ ${shortHash(commit1.id)}-${shortHash(commit2.id)}`,
        payload: { commit1, commit2 },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};

export const useShowLsTree = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addTabAtom);
  return useCallbackWithErrorHandler(
    (commit: Commit) => {
      if (!repoPath) {
        return;
      }
      addTab({
        type: "tree",
        id: `tree:${commit.id}`,
        title: `TREE @ ${shortHash(commit.id)}`,
        payload: { commit },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};

export const useShowFileContent = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addTabAtom);
  return useCallbackWithErrorHandler(
    (commit: Commit, file: FileEntry) => {
      if (!repoPath) {
        return;
      }
      if (file.statusCode === "D") {
        return;
      }
      addTab({
        type: "file",
        id: `blame:${commit.id}/${file.path}`,
        title: `${getFileName(file.path)} @ ${shortHash(commit.id)}`,
        payload: { path: file.path, commit },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};
