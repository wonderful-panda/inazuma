import dispatchBrowser from "@/dispatchBrowser";
import { Grapher, GraphFragment } from "@/grapher";
import { serializeError, toSlashedPath } from "@/util";
import { Dispatch } from "..";
import { HIDE_LOADING, SHOW_ERROR, SHOW_LOADING } from "../misc";
import { ADD_RECENT_OPENED_REPOSITORY } from "../persist";
import { _SET_LOG } from "../repository";

const openRepository = (realPath: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(SHOW_LOADING());
      const path = toSlashedPath(realPath);
      const { commits, refs } = await dispatchBrowser("openRepository", path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      dispatch(ADD_RECENT_OPENED_REPOSITORY(path));
      dispatch(_SET_LOG({ path, commits, refs, graph, keepTabs: false }));
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    } finally {
      dispatch(HIDE_LOADING());
    }
  };
};

export const OPEN_REPOSITORY = openRepository;
