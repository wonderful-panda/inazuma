import { describe, expect, it } from "vitest";
import {
  filterTreeItem,
  filterTreeItems,
  shrinkTreeInplace,
  sortTree,
  sortTreeInplace,
  type TreeItem
} from "./tree";

const byData = (a: TreeItem<number>, b: TreeItem<number>) => a.data - b.data;

describe("sortTreeInplace", () => {
  it("sorts root nodes", () => {
    const nodes: TreeItem<number>[] = [{ data: 3 }, { data: 1 }, { data: 2 }];
    sortTreeInplace(nodes, byData);
    expect(nodes.map((n) => n.data)).toEqual([1, 2, 3]);
  });

  it("sorts children recursively", () => {
    const nodes: TreeItem<number>[] = [
      {
        data: 1,
        children: [{ data: 30 }, { data: 10 }, { data: 20 }]
      }
    ];
    sortTreeInplace(nodes, byData);
    expect(nodes[0]!.children!.map((n) => n.data)).toEqual([10, 20, 30]);
  });

  it("handles nodes without children", () => {
    const nodes: TreeItem<number>[] = [{ data: 2 }, { data: 1 }];
    sortTreeInplace(nodes, byData);
    expect(nodes.map((n) => n.data)).toEqual([1, 2]);
  });
});

describe("sortTree", () => {
  it("returns new array with sorted root nodes", () => {
    const nodes: TreeItem<number>[] = [{ data: 3 }, { data: 1 }, { data: 2 }];
    const result = sortTree(nodes, byData);
    expect(result.map((n) => n.data)).toEqual([1, 2, 3]);
  });

  it("sorts children recursively and returns new objects", () => {
    const original: TreeItem<number>[] = [{ data: 1, children: [{ data: 30 }, { data: 10 }] }];
    const result = sortTree(original, byData);
    expect(result[0]!.children!.map((n) => n.data)).toEqual([10, 30]);
    // original children should be sorted too (sort is in-place first)
  });
});

describe("filterTreeItem", () => {
  it("returns item when predicate matches data", () => {
    const item: TreeItem<number> = { data: 5 };
    expect(filterTreeItem(item, (d) => d === 5)).toBe(item);
  });

  it("returns null when predicate does not match and no children", () => {
    const item: TreeItem<number> = { data: 5 };
    expect(filterTreeItem(item, (d) => d === 99)).toBeNull();
  });

  it("returns item with filtered children when child matches", () => {
    const item: TreeItem<number> = {
      data: 1,
      children: [{ data: 2 }, { data: 3 }]
    };
    const result = filterTreeItem(item, (d) => d === 2);
    expect(result).not.toBeNull();
    expect(result!.data).toBe(1);
    expect(result!.children!.map((c) => c.data)).toEqual([2]);
  });

  it("returns null when no children match predicate", () => {
    const item: TreeItem<number> = {
      data: 1,
      children: [{ data: 2 }, { data: 3 }]
    };
    expect(filterTreeItem(item, (d) => d === 99)).toBeNull();
  });
});

describe("filterTreeItems", () => {
  it("filters top-level items", () => {
    const items: TreeItem<number>[] = [{ data: 1 }, { data: 2 }, { data: 3 }];
    const result = filterTreeItems(items, (d) => d !== 2);
    expect(result.map((i) => i.data)).toEqual([1, 3]);
  });

  it("returns empty array when nothing matches", () => {
    const items: TreeItem<number>[] = [{ data: 1 }, { data: 2 }];
    expect(filterTreeItems(items, () => false)).toEqual([]);
  });
});

describe("shrinkTreeInplace", () => {
  it("shrinks a parent with a single child using shrinkFn", () => {
    const nodes: TreeItem<string>[] = [
      {
        data: "a",
        children: [{ data: "b" }]
      }
    ];
    shrinkTreeInplace(nodes, (parent, child) => ({
      data: `${parent.data}/${child.data}`
    }));
    expect(nodes[0]!.data).toBe("a/b");
    expect(nodes[0]!.children).toBeUndefined();
  });

  it("does not shrink a parent with multiple children", () => {
    const nodes: TreeItem<string>[] = [
      {
        data: "a",
        children: [{ data: "b" }, { data: "c" }]
      }
    ];
    shrinkTreeInplace(nodes, (parent, child) => ({
      data: `${parent.data}/${child.data}`
    }));
    expect(nodes[0]!.data).toBe("a");
    expect(nodes[0]!.children!.length).toBe(2);
  });

  it("shrinks recursively", () => {
    const nodes: TreeItem<string>[] = [
      {
        data: "a",
        children: [
          {
            data: "b",
            children: [{ data: "c" }]
          }
        ]
      }
    ];
    shrinkTreeInplace(nodes, (parent, child) => ({
      data: `${parent.data}/${child.data}`
    }));
    // inner shrink: b/c, then outer shrink: a/(b/c)
    expect(nodes[0]!.data).toBe("a/b/c");
  });
});
