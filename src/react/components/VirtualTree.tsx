import type { TreeItem } from "@/tree";
import classNames from "classnames";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { VirtualList, type VirtualListEvents, type VirtualListMethods } from "./VirtualList";
import type { TreeItemVM, TreeModelDispatch, TreeModelState } from "@/hooks/useTreeModel";

export interface VirtualTreeProps<T> extends VirtualListEvents<TreeItemVM<T>> {
  treeModelState: TreeModelState<T>;
  treeModelDispatch: TreeModelDispatch<T>;
  itemSize: number | ((data: T) => number);
  getItemKey: (data: T) => string;
  renderRow: (item: TreeItem<T>, index: number, expanded: boolean) => React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ExpandButton: React.FC<{ expanded: boolean; size: number }> = ({ expanded, size }) => (
  <svg
    width={size}
    height={size}
    className={classNames("my-auto cursor-pointer", expanded && "rotate-90")}
  >
    <title>toggle expansion</title>
    <polygon
      transform={`translate(${size / 2}, ${size / 2})`}
      points="-1,-4 3,0 -1,4"
      fill="white"
    />
  </svg>
);

const VirtualTreeRowInner = <T,>(props: {
  height: number;
  item: TreeItem<T>;
  index: number;
  level: number;
  expanded: boolean;
  renderRow: (item: TreeItem<T>, index: number, expanded: boolean) => React.ReactNode;
  toggleExpand: (item: TreeItem<T>) => void;
}) => {
  const { height, item, index, level, expanded, renderRow, toggleExpand } = props;
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpand(item);
    },
    [item, toggleExpand]
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
        toggleExpand(item);
      }
    },
    [item, toggleExpand]
  );
  const indent = 16 * level;
  return (
    <div className="flex-row-nowrap my-auto mx-0.5 items-center" style={{ height }}>
      <div
        role="button"
        aria-label="Toggle expand"
        tabIndex={0}
        className="flex my-auto"
        style={{ height, marginLeft: indent, minWidth: 20 }}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {item.children && <ExpandButton expanded={expanded} size={20} />}
      </div>
      {renderRow(item, index, expanded)}
    </div>
  );
};
const VirtualTreeRow = memo(VirtualTreeRowInner) as typeof VirtualTreeRowInner;

export const VirtualTree = <T,>({
  treeModelState,
  treeModelDispatch,
  itemSize,
  getItemKey,
  renderRow,
  ...rest
}: VirtualTreeProps<T>) => {
  const listRef = useRef<VirtualListMethods>(null);
  useEffect(() => {
    listRef.current?.scrollToItem(treeModelState.selectedIndex);
  }, [treeModelState.selectedIndex]);

  const toggleExpand = useCallback(
    (item: TreeItem<T>) => {
      treeModelDispatch({ type: "toggleItem", payload: { item } });
    },
    [treeModelDispatch]
  );
  const getItemKey_ = useCallback(
    (itemVm: TreeItemVM<T>) => getItemKey(itemVm.item.data),
    [getItemKey]
  );
  const itemSize_ = useMemo(() => {
    if (typeof itemSize === "number") {
      return itemSize;
    } else {
      return (index: number) => {
        const vm = treeModelState.visibleItems[index];
        return vm ? itemSize(vm.item.data) : 0;
      };
    }
  }, [itemSize, treeModelState.visibleItems]);
  const children = useCallback(
    ({ index, item: { item, expanded, level } }: { index: number; item: TreeItemVM<T> }) => (
      <VirtualTreeRow<T>
        height={typeof itemSize === "number" ? itemSize : itemSize(item.data)}
        item={item}
        index={index}
        level={level}
        expanded={expanded}
        renderRow={renderRow}
        toggleExpand={toggleExpand}
      />
    ),
    [renderRow, itemSize, toggleExpand]
  );
  return (
    <VirtualList<TreeItemVM<T>>
      ref={listRef}
      items={treeModelState.visibleItems}
      itemSize={itemSize_}
      getItemKey={getItemKey_}
      {...rest}
    >
      {children}
    </VirtualList>
  );
};
