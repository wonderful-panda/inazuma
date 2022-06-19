export interface TreeItem<T> {
  data: T;
  children?: TreeItem<T>[] | null;
}

export function sortTreeInplace<T>(
  nodes: TreeItem<T>[],
  compareFn: (a: TreeItem<T>, b: TreeItem<T>) => number
): void {
  nodes.sort(compareFn);
  nodes.forEach((n) => {
    if (n.children) {
      sortTreeInplace(n.children, compareFn);
    }
  });
}

export const filterTreeItems = <T extends unknown>(
  items: readonly TreeItem<T>[],
  predicate: (item: T) => boolean
): TreeItem<T>[] => {
  return items
    .map((item) => filterTreeItem(item, predicate))
    .filter((item) => !!item) as TreeItem<T>[];
};
export const filterTreeItem = <T extends unknown>(
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
