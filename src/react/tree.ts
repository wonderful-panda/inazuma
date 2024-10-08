export interface TreeItem<T> {
  data: T;
  children?: TreeItem<T>[];
}

export function sortTreeInplace<T>(
  nodes: TreeItem<T>[],
  compareFn: (a: TreeItem<T>, b: TreeItem<T>) => number
): void {
  nodes.sort(compareFn);
  for (const n of nodes) {
    if (n.children) {
      sortTreeInplace(n.children, compareFn);
    }
  }
}

export const filterTreeItems = <T>(
  items: readonly TreeItem<T>[],
  predicate: (item: T) => boolean
): TreeItem<T>[] => {
  return items.map((item) => filterTreeItem(item, predicate)).filter((item) => !!item);
};
export const filterTreeItem = <T>(
  item: TreeItem<T>,
  predicate: (item: T) => boolean
): TreeItem<T> | null => {
  const { data, children: orgChildren } = item;
  if (predicate(data)) {
    return item;
  }
  if (!orgChildren) {
    return null;
  }
  const children = filterTreeItems(orgChildren, predicate);
  if (children.length === 0) {
    return null;
  }
  return { data, children };
};
