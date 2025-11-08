import { type SetStateAction, useReducer } from "react";
import type { TreeItem } from "@/tree";
import { assertNever } from "@/util";

export interface TreeItemVM<D> {
  item: TreeItem<D>;
  level: number;
  expanded: boolean;
  parent: TreeItemVM<D> | undefined;
}

export type ItemSpec<D> = { item: TreeItem<D> } | { index: number };

export interface ActionPayload<D = unknown> {
  reset: {
    items: readonly TreeItem<D>[];
  };
  expandItem: ItemSpec<D>;
  collapseItem: ItemSpec<D>;
  toggleItem: ItemSpec<D>;
  expandAll: never;
  collapseAll: never;
  setSelectedIndex: SetStateAction<number>;
  setSelectedItem: TreeItemVM<D> | undefined;
  selectByPredicate: (item: TreeItemVM<D>) => boolean;
  expandOrSelectChild: never;
  collapseOrSelectParent: never;
}

export type Action<T, A = ActionPayload<T>> = {
  [K in keyof A]: A[K] extends never ? { type: K } : { type: K; payload: A[K] };
}[keyof A];

export interface TreeModelState<D> {
  getItemKey: (item: D) => string;
  rootItems: readonly TreeItem<D>[];
  visibleItems: readonly TreeItemVM<D>[];
  expandedItems: Set<string>;
  selectedIndex: number;
  selectedItem: TreeItemVM<D> | undefined;
}

const initialState = <D>(getItemKey: (item: D) => string): TreeModelState<D> => ({
  getItemKey,
  rootItems: [],
  visibleItems: [],
  expandedItems: new Set(),
  selectedIndex: -1,
  selectedItem: undefined
});

const getBacktrackToRootItem = <D>(itemVm: TreeItemVM<D>): TreeItemVM<D>[] => {
  let cur: TreeItemVM<D> | undefined = itemVm;
  const ret: TreeItemVM<D>[] = [];
  while (cur !== undefined) {
    ret.push(cur);
    cur = cur.parent;
  }
  return ret;
};

function* walkTree<T>(rootItems: readonly TreeItem<T>[]): Generator<TreeItem<T>> {
  for (const item of rootItems) {
    yield item;
    if (item.children) {
      yield* walkTree(item.children);
    }
  }
}

function* gatherVisibleItems<D>(
  level: number,
  parent: TreeItemVM<D> | undefined,
  rootItems: readonly TreeItem<D>[],
  getItemKey: (item: D) => string,
  expandedItems: Set<string>
): Generator<TreeItemVM<D>> {
  for (const item of rootItems) {
    if (item.children) {
      const expanded = expandedItems.has(getItemKey(item.data));
      const vm: TreeItemVM<D> = { item, parent, level, expanded };
      yield vm;
      if (expanded) {
        yield* gatherVisibleItems(level + 1, vm, item.children, getItemKey, expandedItems);
      }
    } else {
      yield { item, parent, level, expanded: false };
    }
  }
}

const recomputeStateAfterExpandOrCollapse = <D>(
  state: TreeModelState<D>,
  expandedItems: Set<string>
): TreeModelState<D> => {
  const { selectedIndex, selectedItem, rootItems, getItemKey } = state;
  const visibleItems = [...gatherVisibleItems(0, undefined, rootItems, getItemKey, expandedItems)];
  if (!selectedItem) {
    return { ...state, expandedItems, visibleItems };
  } else if (
    visibleItems[selectedIndex] &&
    visibleItems[selectedIndex].item.data === selectedItem?.item.data
  ) {
    // index of selected item is not changed
    return { ...state, expandedItems, visibleItems, selectedItem: visibleItems[selectedIndex] };
  } else {
    // search new index of selected item
    // if selected item is not visible, select last visible ancester instead
    const itemVms = getBacktrackToRootItem(selectedItem);
    let lastIndex = -1;
    let itemVm = itemVms.pop();
    for (const [index, vm] of visibleItems.entries()) {
      if (!itemVm) {
        break;
      } else if (vm.item.data === itemVm.item.data) {
        lastIndex = index;
        itemVm = itemVms.pop();
      }
    }
    return {
      ...state,
      expandedItems,
      visibleItems,
      selectedIndex: lastIndex,
      selectedItem: visibleItems[lastIndex]
    };
  }
};

const reset = <T>(
  state: TreeModelState<T>,
  payload: ActionPayload<T>["reset"]
): TreeModelState<T> => {
  const newState = {
    ...state,
    rootItems: payload.items
  };
  return recomputeStateAfterExpandOrCollapse(newState, state.expandedItems);
};

const expandItem = <T>(
  state: TreeModelState<T>,
  itemSpec: ActionPayload<T>["expandItem"]
): TreeModelState<T> => {
  const item = "item" in itemSpec ? itemSpec.item : state.visibleItems[itemSpec.index]?.item;
  if (!item?.children) {
    return state;
  }
  const key = state.getItemKey(item.data);
  if (state.expandedItems.has(key)) {
    return state;
  }
  const newExpandedItems = new Set(state.expandedItems).add(key);
  return recomputeStateAfterExpandOrCollapse(state, newExpandedItems);
};

const collapseItem = <T>(
  state: TreeModelState<T>,
  itemSpec: ActionPayload<T>["collapseItem"]
): TreeModelState<T> => {
  const item = "item" in itemSpec ? itemSpec.item : state.visibleItems[itemSpec.index]?.item;
  if (!item?.children) {
    return state;
  }
  const key = state.getItemKey(item.data);
  if (!state.expandedItems.has(key)) {
    return state;
  }
  const newExpandedItems = new Set(state.expandedItems);
  newExpandedItems.delete(key);
  return recomputeStateAfterExpandOrCollapse(state, newExpandedItems);
};

const toggleItem = <T>(
  state: TreeModelState<T>,
  itemSpec: ActionPayload<T>["toggleItem"]
): TreeModelState<T> => {
  const item = "item" in itemSpec ? itemSpec.item : state.visibleItems[itemSpec.index]?.item;
  if (!item?.children) {
    return state;
  }
  const newExpandedItems = new Set(state.expandedItems);
  const key = state.getItemKey(item.data);
  if (newExpandedItems.has(key)) {
    newExpandedItems.delete(key);
  } else {
    newExpandedItems.add(key);
  }
  return recomputeStateAfterExpandOrCollapse(state, newExpandedItems);
};

const setSelectedIndex = <T>(
  state: TreeModelState<T>,
  value: ActionPayload<T>["setSelectedIndex"]
): TreeModelState<T> => {
  const selectedIndex = typeof value === "function" ? value(state.selectedIndex) : value;
  const selectedItem = state.visibleItems[selectedIndex];
  return { ...state, selectedIndex, selectedItem };
};

const setSelectedItem = <T>(
  state: TreeModelState<T>,
  itemVm: ActionPayload<T>["setSelectedItem"]
): TreeModelState<T> => {
  if (!itemVm) {
    return { ...state, selectedIndex: -1, selectedItem: undefined };
  } else {
    const selectedIndex = state.visibleItems.findIndex((v) => v.item.data === itemVm.item.data);
    return { ...state, selectedIndex, selectedItem: state.visibleItems[selectedIndex] };
  }
};

const selectByPredicate = <T>(
  state: TreeModelState<T>,
  predicate: ActionPayload<T>["selectByPredicate"]
): TreeModelState<T> => {
  const selectedIndex = state.visibleItems.findIndex(predicate);
  return { ...state, selectedIndex, selectedItem: state.visibleItems[selectedIndex] };
};

const expandAll = <T>(state: TreeModelState<T>): TreeModelState<T> => {
  const expandedItems = new Set<string>();
  const { rootItems, getItemKey } = state;
  for (const item of walkTree(rootItems)) {
    if (item.children) {
      expandedItems.add(getItemKey(item.data));
    }
  }
  return recomputeStateAfterExpandOrCollapse(state, expandedItems);
};

const collapseAll = <T>(state: TreeModelState<T>): TreeModelState<T> => {
  const expandedItems = new Set<string>();
  return recomputeStateAfterExpandOrCollapse(state, expandedItems);
};

const expandOrSelectChild = <T>(state: TreeModelState<T>): TreeModelState<T> => {
  if (!state.selectedItem?.item.children) {
    return state;
  }
  if (state.selectedItem.expanded) {
    if (state.selectedItem.item.children.length > 0) {
      return setSelectedIndex(state, state.selectedIndex + 1);
    } else {
      return state;
    }
  } else {
    return expandItem(state, { item: state.selectedItem.item });
  }
};

const collapseOrSelectParent = <T>(state: TreeModelState<T>): TreeModelState<T> => {
  if (!state.selectedItem) {
    return state;
  }
  const itemVm = state.selectedItem;
  if (itemVm.item.children && itemVm.expanded) {
    return collapseItem(state, { item: itemVm.item });
  } else {
    if (itemVm.parent) {
      return setSelectedItem(state, itemVm.parent);
    } else {
      return state;
    }
  }
};

const reducer = <T>(state: TreeModelState<T>, action: Action<T>) => {
  switch (action.type) {
    case "reset":
      return reset(state, action.payload);
    case "expandItem":
      return expandItem(state, action.payload);
    case "collapseItem":
      return collapseItem(state, action.payload);
    case "toggleItem":
      return toggleItem(state, action.payload);
    case "setSelectedIndex":
      return setSelectedIndex(state, action.payload);
    case "setSelectedItem":
      return setSelectedItem(state, action.payload);
    case "selectByPredicate":
      return selectByPredicate(state, action.payload);
    case "expandAll":
      return expandAll(state);
    case "collapseAll":
      return collapseAll(state);
    case "expandOrSelectChild":
      return expandOrSelectChild(state);
    case "collapseOrSelectParent":
      return collapseOrSelectParent(state);
    default:
      return assertNever(action);
  }
};

export const useTreeModel = <T>(getItemKey: (item: T) => string) => {
  return useReducer(reducer, initialState(getItemKey));
};
export type TreeModelDispatch<T> = React.Dispatch<Action<T>>;
