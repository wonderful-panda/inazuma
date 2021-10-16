import browserApi from "@/browserApi";
import { Grapher, GraphFragment } from "@/grapher";
import { Dispatch } from "..";
import { HIDE_LOADING, SHOW_ERROR, SHOW_LOADING } from "../misc";
import { _SET_LOG } from "../repository";

const openRepository = (path: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(SHOW_LOADING());
      const { commits, refs } = await browserApi.openRepository(path);
      const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
      const graph: Record<string, GraphFragment> = {};
      commits.forEach((c) => {
        graph[c.id] = grapher.proceed(c);
      });
      dispatch(_SET_LOG({ path, commits, refs, graph }));
    } catch (error) {
      dispatch(SHOW_ERROR({ error }));
    } finally {
      dispatch(HIDE_LOADING());
    }
  };
};

export default openRepository;
