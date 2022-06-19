import { Grapher, GraphFragment } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { toSlashedPath } from "@/util";
import { Dispatch, RootState } from "..";
import { HIDE_LOADING, SHOW_LOADING } from "../misc";
import { ADD_RECENT_OPENED_REPOSITORY } from "../persist";
import { _SET_LOG } from "../repository";
import { withHandleError } from "./withHandleError";

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

const openRepository = (realPath: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(SHOW_LOADING());
      const path = toSlashedPath(realPath);
      const { commits, refs } = await fetchHistory(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      dispatch(ADD_RECENT_OPENED_REPOSITORY(path));
      dispatch(_SET_LOG({ path, commits, refs: makeRefs(refs), graph, keepTabs: false }));
    } finally {
      dispatch(HIDE_LOADING());
    }
  };
};

const reloadRepository = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const path = state.repository.path;
      if (!path) {
        return;
      }
      dispatch(SHOW_LOADING());
      const { commits, refs } = await fetchHistory(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      dispatch(_SET_LOG({ path, commits, refs: makeRefs(refs), graph, keepTabs: true }));
    } finally {
      dispatch(HIDE_LOADING());
    }
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

export const OPEN_REPOSITORY = withHandleError(openRepository);
export const RELOAD_REPOSITORY = withHandleError(reloadRepository);
