import { useCallback, useMemo } from "react";
import { useListIndexChanger, ListItemSelector } from "./useListIndexChanger";
import { TreeModelDispatch, TreeModelState } from "./useTreeModel";

export const useTreeIndexChanger = <T>(
  treeModelState: TreeModelState<T>,
  treeModelDispatch: TreeModelDispatch<T>
): ListItemSelector => {
  const setSelectedIndex = useCallback<SetState<number>>(
    (value) => {
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
  return useListIndexChanger(
    treeModelState.visibleItems.length,
    setSelectedIndex,
    extraKeyHandlers
  );
};
