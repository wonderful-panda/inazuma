import { closeRepositoryAtom, repoPathAtom } from "@/state/repository";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { getFileName, toSlashedPath } from "@/util";
import { GraphFragment, Grapher } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { setLogToRepositoryStoreAtom, useAddRecentOpenedRepository } from "@/state/root";
import { addAppTabAtom, appTabsAtom, selectAppTabAtom } from "@/state/tabs";

const fetchHistory = async (repoPath: string) => {
  const [commits, refs] = await invokeTauriCommand("fetch_history", {
    repoPath,
    maxCount: 1000
  });
  if (refs.head) {
    commits.unshift({
      id: "--",
      author: "--",
      date: Date.now(),
      summary: "<Working tree>",
      parentIds: [refs.head, ...refs.mergeHeads]
    });
  }
  return { commits, refs };
};

const makeRefs = (rawRefs: RawRefs): Refs => {
  const { head, mergeHeads, refs: refArray } = rawRefs;
  const refs: Refs = {
    head: head || undefined,
    mergeHeads,
    branches: [],
    tags: [],
    remotes: {},
    refsById: {}
  };
  refArray.forEach((r) => {
    switch (r.type) {
      case "branch":
        refs.branches.push(r);
        break;
      case "tag":
        refs.tags.push(r);
        break;
      case "remote":
        (refs.remotes[r.remote] || (refs.remotes[r.remote] = [])).push(r);
        break;
      default:
        break;
    }
    (refs.refsById[r.id] || (refs.refsById[r.id] = [])).push(r);
  });
  const types: Ref["type"][] = ["branch", "tag", "remote"];
  const compare = (a: Ref, b: Ref) => {
    if (a.type === b.type) {
      if (a.type === "branch" && b.type === "branch") {
        if (a.current) {
          return -1;
        } else if (b.current) {
          return 1;
        }
      }
      return a.fullname.localeCompare(b.fullname);
    } else {
      return types.indexOf(a.type) - types.indexOf(b.type);
    }
  };
  Object.values(refs.refsById).forEach((v) => v.sort(compare));
  return refs;
};

export const useOpenRepository = () => {
  const appTabs = useAtomValue(appTabsAtom);
  const addAppTab = useSetAtom(addAppTabAtom);
  const selectAppTab = useSetAtom(selectAppTabAtom);
  const addRecentOpenedRepository = useAddRecentOpenedRepository();
  const setLogToRepositoryStore = useSetAtom(setLogToRepositoryStoreAtom);
  return useCallbackWithErrorHandler(
    async (realPath: string) => {
      const path = toSlashedPath(realPath);
      const index = appTabs.tabs.findIndex(
        (tab) => tab.type === "repository" && path === tab.payload.path
      );
      if (0 <= index) {
        selectAppTab(index);
        return;
      }
      const { commits, refs } = await fetchHistory(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      await invokeTauriCommand("open_repository", { repoPath: path });
      addRecentOpenedRepository(path);
      addAppTab({
        type: "repository",
        id: `__REPO__:${path}`,
        title: getFileName(path),
        payload: { path },
        closable: true
      });
      setLogToRepositoryStore({ path, commits, refs: makeRefs(refs), graph, keepTabs: false });
    },
    [appTabs.tabs, addAppTab, selectAppTab, addRecentOpenedRepository, setLogToRepositoryStore],
    { loading: true }
  );
};

export const useReloadSpecifiedRepository = () => {
  const setLogToRepositoryStore = useSetAtom(setLogToRepositoryStoreAtom);
  return useCallbackWithErrorHandler(
    async (path: string) => {
      const { commits, refs } = await fetchHistory(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      setLogToRepositoryStore({ path, commits, refs: makeRefs(refs), graph, keepTabs: true });
    },
    [setLogToRepositoryStore],
    { loading: true }
  );
};

export const useReloadRepository = () => {
  const path = useAtomValue(repoPathAtom);
  const reloadSpecifiedRepository = useReloadSpecifiedRepository();
  return useCallback(() => reloadSpecifiedRepository(path), [path, reloadSpecifiedRepository]);
};

export const useCloseRepository = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const closeRepository = useSetAtom(closeRepositoryAtom);
  return useCallbackWithErrorHandler(async () => {
    if (!repoPath) {
      return;
    }
    closeRepository();
    await invokeTauriCommand("close_repository", { repoPath });
  }, [repoPath, closeRepository]);
};
