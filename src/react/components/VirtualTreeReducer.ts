import { TreeItem } from "@/tree";
import { assertNever } from "@/util";
import { Reducer, SetStateAction, useReducer } from "react";
import { VisibleItem } from "./VirtualTree";

export type Actions<T = unknown> = {
  reset: {
    items: readonly TreeItem<T>[];
    getItemKey: (data: T) => string;
  };
  expandItem: TreeItem<T>;
  collapseItem: TreeItem<T>;
  toggleItem: TreeItem<T>;
  expandAll: never;
  collapseAll: never;
  setSelectedIndex: SetStateAction<number>;
  setSelectedItem: VisibleItem<T> | undefined;
};

export type Action<T, A = Actions<T>> = {
  [K in keyof A]: A[K] extends never ? { type: K } : { type: K; payload: A[K] };
}[keyof A];

interface State<T> {
  getItemKey: (data: T) => string;
  items: readonly TreeItem<T>[];
  visibleItems: readonly VisibleItem<T>[];
  expandedItems: Set<string>;
  selectedIndex: number;
  selectedItem: VisibleItem<T> | undefined;
}

const initialState: State<any> = {
  getItemKey: () => "",
  items: [],
  visibleItems: [],
  expandedItems: new Set(),
  selectedIndex: -1,
  selectedItem: undefined
};

function gatherItemsInPath<T>(vitem: VisibleItem<T>): TreeItem<T>[] {
  let cur: VisibleItem<T> | undefined = vitem;
  const ret: TreeItem<T>[] = [];
  while (cur !== undefined) {
    ret.push(cur.item);
    cur = cur.parent;
  }
  return ret;
}

function* walkTree<T>(rootItems: readonly TreeItem<T>[]): Generator<TreeItem<T>> {
  for (const item of rootItems) {
    yield item;
    if (item.children) {
      yield* walkTree(item.children);
    }
  }
}

function* gatherVisibleItems<T>(
  getItemKey: (data: T) => string,
  level: number,
  parent: VisibleItem<T> | undefined,
  rootItems: readonly TreeItem<T>[],
  expandedItems: Set<string>
): Generator<VisibleItem<T>> {
  for (const item of rootItems) {
    if (item.children) {
      const expanded = expandedItems.has(getItemKey(item.data));
      const vitem = { item, parent, level, expanded };
      yield vitem;
      if (expanded) {
        yield* gatherVisibleItems(getItemKey, level + 1, vitem, item.children, expandedItems);
      }
    } else {
      yield { item, parent, level, expanded: false };
    }
  }
}

const recomputeStateAfterExpandOrCollapse = <T extends unknown>(
  state: State<T>,
  expandedItems: Set<string>
): State<T> => {
  const { selectedIndex, selectedItem, getItemKey, items } = state;
  const visibleItems = [...gatherVisibleItems(getItemKey, 0, undefined, items, expandedItems)];
  if (!selectedItem) {
    return { ...state, expandedItems, visibleItems };
  } else if (
    visibleItems[selectedIndex] &&
    visibleItems[selectedIndex].item === selectedItem?.item
  ) {
    return { ...state, expandedItems, visibleItems, selectedItem: visibleItems[selectedIndex] };
  } else {
    // search new index of selected item
    // if selected item is not visible, select last visible ancester instead
    const items = gatherItemsInPath(selectedItem);
    let lastIndex = -1;
    let item = items.pop();
    for (const [index, vitem] of visibleItems.entries()) {
      if (vitem.item === item) {
        lastIndex = index;
        item = items.pop();
        if (!item) {
          break;
        }
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

function reset<T>(state: State<T>, payload: Actions<T>["reset"]): State<T> {
  return {
    ...state,
    ...payload,
    visibleItems: [
      ...gatherVisibleItems(payload.getItemKey, 0, undefined, payload.items, state.expandedItems)
    ]
  };
}

function expandItem<T>(state: State<T>, item: Actions<T>["expandItem"]): State<T> {
  if (!item.children) {
    return state;
  }
  const id = state.getItemKey(item.data);
  if (state.expandedItems.has(id)) {
    return state;
  }
  const newExpandedItems = new Set(state.expandedItems).add(id);
  return recomputeStateAfterExpandOrCollapse(state, newExpandedItems);
}

function collapseItem<T>(state: State<T>, item: Actions<T>["collapseItem"]): State<T> {
  if (!item.children) {
    return state;
  }
  const id = state.getItemKey(item.data);
  if (!state.expandedItems.has(id)) {
    return state;
  }
  const newExpandedItems = new Set(state.expandedItems);
  newExpandedItems.delete(id);
  return recomputeStateAfterExpandOrCollapse(state, newExpandedItems);
}

function toggleItem<T>(state: State<T>, item: Actions<T>["toggleItem"]): State<T> {
  if (!item.children) {
    return state;
  }
  const id = state.getItemKey(item.data);
  const newExpandedItems = new Set(state.expandedItems);
  if (newExpandedItems.has(id)) {
    newExpandedItems.delete(id);
  } else {
    newExpandedItems.add(id);
  }
  return recomputeStateAfterExpandOrCollapse(state, newExpandedItems);
}

function setSelectedIndex<T>(state: State<T>, value: Actions<T>["setSelectedIndex"]): State<T> {
  const selectedIndex = typeof value === "function" ? value(state.selectedIndex) : value;
  const selectedItem = state.visibleItems[selectedIndex];
  return { ...state, selectedIndex, selectedItem };
}

function setSelectedItem<T>(state: State<T>, vitem: Actions<T>["setSelectedItem"]): State<T> {
  if (!vitem) {
    return { ...state, selectedIndex: -1, selectedItem: undefined };
  } else {
    const selectedIndex = state.visibleItems.findIndex((v) => v.item === vitem.item);
    return { ...state, selectedIndex, selectedItem: state.visibleItems[selectedIndex] };
  }
}

function expandAll<T>(state: State<T>): State<T> {
  const expandedItems = new Set<string>();
  for (const item of walkTree(state.items)) {
    if (item.children) {
      expandedItems.add(state.getItemKey(item.data));
    }
  }
  return recomputeStateAfterExpandOrCollapse(state, expandedItems);
}

function collapseAll<T>(state: State<T>): State<T> {
  const expandedItems = new Set<string>();
  return recomputeStateAfterExpandOrCollapse(state, expandedItems);
}

const reducer = <T extends unknown>(state: State<T>, action: Action<T>) => {
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
    case "expandAll":
      return expandAll(state);
    case "collapseAll":
      return collapseAll(state);
    default:
      return assertNever(action);
  }
};

const useVirtualTreeReducer = <T extends unknown>() => {
  return useReducer<Reducer<State<T>, Action<T>>>(reducer, initialState);
};
export default useVirtualTreeReducer;
