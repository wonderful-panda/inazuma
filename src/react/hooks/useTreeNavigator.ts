import { useCallback, useMemo } from "react";
import useIndexNavigator, { IndexNavigator } from "./useIndexNavigator";
import { TreeModelDispatch, TreeModelState } from "./useTreeModel";

const useTreeNavigator = <T>(
  treeModelState: TreeModelState<T>,
  treeModelDispatch: TreeModelDispatch<T>
): IndexNavigator => {
  const setSelectedIndex = useCallback(
    (value: React.SetStateAction<number>) => {
      treeModelDispatch({ type: "setSelectedIndex", payload: value });
    },
    [treeModelDispatch]
  );
  const extraKeyHandlers = useMemo(
    () => ({
      ArrowRight: () => treeModelDispatch({ type: "expandOrSelectChild" }),
      ArrowLeft: () => treeModelDispatch({ type: "collapseOrSelectParent" })
    }),
    [treeModelDispatch]
  );
  return useIndexNavigator(treeModelState.visibleItems.length, setSelectedIndex, extraKeyHandlers);
};

export default useTreeNavigator;
