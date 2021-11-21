import { useCallback, useMemo } from "react";
import { useListItemSelector, ListItemSelector } from "./useListItemSelector";
import { TreeModelDispatch, TreeModelState } from "./useTreeModel";

export const useTreeItemSelector = <T>(
  treeModelState: TreeModelState<T>,
  treeModelDispatch: TreeModelDispatch<T>
): ListItemSelector => {
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
  return useListItemSelector(
    treeModelState.visibleItems.length,
    setSelectedIndex,
    extraKeyHandlers
  );
};
