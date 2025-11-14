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

export function filterTreeItems<T>(
  items: readonly TreeItem<T>[],
  predicate: (item: T) => boolean
): TreeItem<T>[] {
  return items.map((item) => filterTreeItem(item, predicate)).filter((item) => !!item);
}

export function filterTreeItem<T>(
  item: TreeItem<T>,
  predicate: (item: T) => boolean
): TreeItem<T> | null {
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
}

export function shrinkTreeInplace<T>(
  nodes: TreeItem<T>[],
  shrinkFn: (parent: TreeItem<T>, child: TreeItem<T>) => TreeItem<T>
) {
  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i]!;
    if (node.children !== undefined) {
      shrinkTreeInplace(node.children, shrinkFn);
      const child = node.children[0];
      if (child !== undefined && node.children.length === 1) {
        const newNode = shrinkFn(node, child);
        if (node !== newNode) {
          nodes[i] = newNode;
        }
      }
    }
  }
}
