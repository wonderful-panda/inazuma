import { TreeNode } from "vue-vtable";

export function filterTreeNodes<T>(
  nodes: ReadonlyArray<TreeNode<T>>,
  predicate: (n: T) => boolean
): TreeNode<T>[] {
  return nodes
    .map(n => filterTreeNode(n, predicate))
    .filter(n => n !== null) as TreeNode<T>[];
}

function filterTreeNode<T>(
  node: TreeNode<T>,
  predicate: (n: T) => boolean
): TreeNode<T> | null {
  const { data, children: orgChildren } = node;
  if (predicate(data)) {
    return node;
  }
  if (!orgChildren) {
    return null;
  }
  const children = filterTreeNodes(orgChildren, predicate);
  if (children.length === 0) {
    return null;
  }
  return { ...node, children };
}
