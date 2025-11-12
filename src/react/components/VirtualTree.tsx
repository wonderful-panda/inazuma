import classNames from "classnames";
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef
} from "react";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useTreeIndexChanger } from "@/hooks/useTreeIndexChanger";
import { type TreeItemVM, type TreeModelDispatch, useTreeModel } from "@/hooks/useTreeModel";
import type { TreeItem } from "@/tree";
import { KeyDownTrapper } from "./KeyDownTrapper";
import { VirtualList, type VirtualListEvents, type VirtualListMethods } from "./VirtualList";

export interface VirtualTreeProps<T> extends VirtualListEvents<TreeItemVM<T>> {
  dispatchRef?: React.RefObject<TreeModelDispatch<T> | null>;
  rootItems: readonly TreeItem<T>[];
  itemSize: number | ((data: T) => number);
  getItemKey: (data: T) => string;
  renderRow: (item: TreeItem<T>, index: number, expanded: boolean) => React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onSelectionChange?: (index: number, item: TreeItem<T> | undefined) => void;
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
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setTimeout(() => {
        toggleExpand(item);
      }, 0);
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
        className="flex my-auto"
        style={{ height, marginLeft: indent, minWidth: 20 }}
        onMouseDown={onMouseDown}
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
  dispatchRef,
  rootItems,
  itemSize,
  getItemKey,
  renderRow,
  onKeyDown,
  onSelectionChange,
  ...rest
}: VirtualTreeProps<T>) => {
  const [state, dispatch] = useTreeModel(getItemKey);
  const { handleKeyDown, handleRowMouseDown } = useTreeIndexChanger(state, dispatch);
  useLayoutEffect(
    () => dispatch({ type: "reset", payload: { items: rootItems } }),
    [dispatch, rootItems]
  );
  useImperativeHandle(dispatchRef, () => dispatch, [dispatch]);

  const handleKeyDown_ = useCallback(
    (e: React.KeyboardEvent) => {
      if (!handleKeyDown(e)) {
        onKeyDown?.(e);
      }
    },
    [handleKeyDown, onKeyDown]
  );

  const listRef = useRef<VirtualListMethods>(null);
  useEffect(() => {
    listRef.current?.scrollToItem(state.selectedIndex);
  }, [state.selectedIndex]);

  useEffect(() => {
    onSelectionChange?.(state.selectedIndex, state.selectedItem?.item);
  }, [state.selectedIndex, state.selectedItem, onSelectionChange]);

  const toggleExpand = useCallback(
    (item: TreeItem<T>) => {
      dispatch({ type: "toggleItem", payload: { item } });
    },
    [dispatch]
  );
  const itemSize_ = useMemo(() => {
    if (typeof itemSize === "number") {
      return itemSize;
    } else {
      return (index: number) => {
        const vm = state.visibleItems[index];
        return vm ? itemSize(vm.item.data) : 0;
      };
    }
  }, [itemSize, state.visibleItems]);
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
    <SelectedIndexProvider value={state.selectedIndex}>
      <KeyDownTrapper onKeyDown={handleKeyDown_}>
        <VirtualList<TreeItemVM<T>>
          ref={listRef}
          items={state.visibleItems}
          itemSize={itemSize_}
          onRowMouseDown={handleRowMouseDown}
          {...rest}
        >
          {children}
        </VirtualList>
      </KeyDownTrapper>
    </SelectedIndexProvider>
  );
};
