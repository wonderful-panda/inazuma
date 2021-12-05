import { dispatchBrowser } from "@/dispatchBrowser";
import { Grapher, GraphFragment } from "@/grapher";
import { Dispatch, RootState } from "..";
import { HIDE_LOADING, SHOW_LOADING } from "../misc";
import { _SET_LOG } from "../repository";
import { withHandleError } from "./withHandleError";

const reloadRepository = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const path = state.repository.path;
      if (!path) {
        return;
      }
      dispatch(SHOW_LOADING());
      const { commits, refs } = await dispatchBrowser("openRepository", path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      dispatch(_SET_LOG({ path, commits, refs, graph, keepTabs: true }));
    } finally {
      dispatch(HIDE_LOADING());
    }
  };
};

export const RELOAD_REPOSITORY = withHandleError(reloadRepository);
