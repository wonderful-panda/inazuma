import { Grapher, GraphFragment } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { toSlashedPath } from "@/util";
import { Dispatch, RootState } from "..";
import { _CLOSE_REPOSITORY, _SET_LOG } from "../repository";
import { withHandleError } from "./withHandleError";
import { withLoading } from "./withLoading";

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

const openRepository = (realPath: string, addRecentOpened: (repoPath: string) => void) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const currentPath = getState().repository.path;
    const path = toSlashedPath(realPath);
    const { commits, refs } = await fetchHistory(path);
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const graph: Record<string, GraphFragment> = {};
    commits.forEach((c) => {
      graph[c.id] = grapher.proceed(c);
    });
    if (currentPath) {
      await invokeTauriCommand("close_repository", { repoPath: path });
    }
    await invokeTauriCommand("open_repository", { repoPath: path });
    addRecentOpened(path);
    dispatch(_SET_LOG({ path, commits, refs: makeRefs(refs), graph, keepTabs: false }));
  };
};

const reloadRepository = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const path = state.repository.path;
    if (!path) {
      return;
    }
    const { commits, refs } = await fetchHistory(path);
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const graph: Record<string, GraphFragment> = {};
    commits.forEach((c) => {
      graph[c.id] = grapher.proceed(c);
    });
    dispatch(_SET_LOG({ path, commits, refs: makeRefs(refs), graph, keepTabs: true }));
  };
};

const closeRepository = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    dispatch(_CLOSE_REPOSITORY());
    await invokeTauriCommand("close_repository", { repoPath });
  };
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

export const OPEN_REPOSITORY = withLoading(withHandleError(openRepository));
export const RELOAD_REPOSITORY = withLoading(withHandleError(reloadRepository));
export const CLOSE_REPOSITORY = withHandleError(closeRepository);
