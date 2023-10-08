import { logAtom, repoPathAtom, setLogToRepositoryStoreAtom } from "@/state/repository";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { getFileName, toSlashedPath } from "@/util";
import { GraphFragment, Grapher } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAddRecentOpenedRepository } from "@/state/root";
import { useAddAppTab, useAppTabsValue, useSelectAppTab } from "@/state/tabs";

const fetchHistory = async (repoPath: string, reflogCount: number) => {
  const [commits, rawRefs] = await invokeTauriCommand("fetch_history", {
    repoPath,
    maxCount: 1000,
    reflogCount
  });
  if (rawRefs.head) {
    commits.unshift({
      id: "--",
      author: "--",
      date: Date.now(),
      summary: "<Working tree>",
      parentIds: [rawRefs.head, ...rawRefs.mergeHeads]
    });
  }
  const refs = makeRefs(rawRefs);
  const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"], refs);
  const graph: Record<string, GraphFragment> = {};
  commits.forEach((c) => {
    graph[c.id] = grapher.proceed(c);
  });
  return { commits, refs, graph };
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
  const types: Ref["type"][] = ["branch", "tag", "remote", "reflog"];
  const compare = (a: Ref, b: Ref) => {
    if (a.type === b.type) {
      if (a.type === "branch" && b.type === "branch" && a.current !== b.current) {
        return a.current ? -1 : 1;
      } else if (a.type === "reflog" && b.type === "reflog") {
        return a.index - b.index;
      } else {
        return a.fullname.localeCompare(b.fullname);
      }
    } else {
      return types.indexOf(a.type) - types.indexOf(b.type);
    }
  };
  Object.values(refs.refsById).forEach((v) => v.sort(compare));
  return refs;
};

export const useOpenRepository = () => {
  const appTabs = useAppTabsValue();
  const addAppTab = useAddAppTab();
  const selectAppTab = useSelectAppTab();
  const addRecentOpenedRepository = useAddRecentOpenedRepository();
  const setLogToRepositoryStore = useSetAtom(setLogToRepositoryStoreAtom);
  return useCallbackWithErrorHandler(
    async (realPath: string) => {
      const path = toSlashedPath(realPath);
      const { commits, refs, graph } = await fetchHistory(path, 0);
      const index = appTabs.tabs.findIndex(
        (tab) => tab.type === "repository" && path === tab.payload.path
      );
      if (0 <= index) {
        setLogToRepositoryStore({ path, commits, refs, graph, keepTabs: true });
        selectAppTab(index);
        return;
      }
      await invokeTauriCommand("open_repository", { repoPath: path });
      addRecentOpenedRepository(path);
      setLogToRepositoryStore({ path, commits, refs, graph, keepTabs: false });
      addAppTab({
        type: "repository",
        id: `__REPO__:${path}`,
        title: getFileName(path),
        payload: { path },
        closable: true
      });
    },
    [appTabs.tabs, addAppTab, selectAppTab, addRecentOpenedRepository, setLogToRepositoryStore],
    { loading: true }
  );
};

export const useReloadSpecifiedRepository = () => {
  const setLogToRepositoryStore = useSetAtom(setLogToRepositoryStoreAtom);
  return useCallbackWithErrorHandler(
    async (path: string) => {
      const { commits, refs, graph } = await fetchHistory(path, 0);
      setLogToRepositoryStore({ path, commits, refs, graph, keepTabs: true });
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

export const useLoadRepositoryIfNotYet = () => {
  const notLoadedYet = useAtomValue(logAtom) === undefined;
  const reloadRepository = useReloadRepository();
  return useCallback(() => {
    if (notLoadedYet) {
      reloadRepository();
    }
  }, [notLoadedYet, reloadRepository]);
};
