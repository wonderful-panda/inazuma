import { GraphFragment, Grapher } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { toSlashedPath } from "@/util";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useAddRecentOpenedRepository, useConfigValue, useShowWarning } from "../root";
import { useCallbackWithErrorHandler } from "../util";
import {
  activeDialogAtom,
  commitDetailAtom,
  logAtom,
  repoPathAtom,
  tabsAtom,
  workingTreeAtom
} from "./premitive";

export const useRepoPathValue = () => useAtomValue(repoPathAtom);

const setLogAtom = atom(
  null,
  (
    _get,
    set,
    update: {
      path: string;
      keepTabs: boolean;
      commits: Commit[];
      refs: Refs;
      graph: Record<string, GraphFragment>;
    }
  ) => {
    const { path, keepTabs, commits, refs, graph } = update;
    set(repoPathAtom, path);
    set(logAtom, { commits, refs, graph });
    set(commitDetailAtom, undefined);
    set(workingTreeAtom, undefined);
    set(activeDialogAtom, { opened: false, version: 0, param: undefined });
    if (!keepTabs) {
      set(tabsAtom, {
        tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
        currentIndex: 0
      });
    }
  }
);

const closeRepositoryAtom = atom(null, (_get, set) => {
  set(repoPathAtom, undefined);
  set(logAtom, undefined);
  set(commitDetailAtom, undefined);
  set(workingTreeAtom, undefined);
  set(tabsAtom, { tabs: [], currentIndex: -1 });
  set(activeDialogAtom, { opened: false, version: 0, param: undefined });
});

const setCommitDetailAtom = atom(
  null,
  (get, set, update: { repoPath: string; value: CommitDetail }) => {
    if (get(repoPathAtom) === update.repoPath) {
      set(commitDetailAtom, update.value);
    }
  }
);

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

export const openRepositoryAtom = atom(null, async (get, set, realPath: string) => {
  const currentPath = get(repoPathAtom);
  const path = toSlashedPath(realPath);
  const { commits, refs } = await fetchHistory(path);
  const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
  const graph: Record<string, GraphFragment> = {};
  commits.forEach((c) => {
    graph[c.id] = grapher.proceed(c);
  });
  if (currentPath) {
    await invokeTauriCommand("close_repository", { repoPath: currentPath });
  }
  await invokeTauriCommand("open_repository", { repoPath: path });
  set(setLogAtom, { path, commits, refs: makeRefs(refs), graph, keepTabs: false });
});

export const useOpenRepository = () => {
  const currentPath = useAtomValue(repoPathAtom);
  const addRecentOpenedRepository = useAddRecentOpenedRepository();
  const setLog = useSetAtom(setLogAtom);
  return useCallbackWithErrorHandler(
    async (realPath: string) => {
      const path = toSlashedPath(realPath);
      const { commits, refs } = await fetchHistory(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      if (currentPath) {
        await invokeTauriCommand("close_repository", { repoPath: currentPath });
      }
      await invokeTauriCommand("open_repository", { repoPath: path });
      addRecentOpenedRepository(path);
      setLog({ path, commits, refs: makeRefs(refs), graph, keepTabs: false });
    },
    [currentPath, addRecentOpenedRepository, setLog],
    { loading: true }
  );
};

export const useReloadRepository = () => {
  const path = useAtomValue(repoPathAtom);
  const setLog = useSetAtom(setLogAtom);
  return useCallbackWithErrorHandler(
    async () => {
      if (!path) {
        return;
      }
      const { commits, refs } = await fetchHistory(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      setLog({ path, commits, refs: makeRefs(refs), graph, keepTabs: false });
    },
    [path, setLog],
    { loading: true }
  );
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

export const useFetchCommitDetail = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const setCommitDetail = useSetAtom(setCommitDetailAtom);
  return useCallbackWithErrorHandler(
    async (revspec: string) => {
      if (!repoPath) {
        return;
      }
      const value = await invokeTauriCommand("get_commit_detail", { repoPath, revspec });
      setCommitDetail({ repoPath, value });
    },
    [repoPath, setCommitDetail]
  );
};

export const useShowExternalDiff = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const config = useConfigValue();
  const showWarning = useShowWarning();
  return useCallbackWithErrorHandler(
    async (left: FileSpec, right: FileSpec) => {
      if (!repoPath) {
        return;
      }
      if (!config.externalDiffTool) {
        showWarning("External diff tool is not configured");
        return;
      }
      await invokeTauriCommand("show_external_diff", { repoPath, left, right });
    },
    [repoPath, config.externalDiffTool, showWarning]
  );
};
