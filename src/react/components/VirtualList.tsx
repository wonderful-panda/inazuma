import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";

const MemoizedFixedSizeList = memo(FixedSizeList);
const MemoizedVariableSizeList = memo(VariableSizeList);

export interface VirtualListEvents<T> {
  onRowClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowMouseDown?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowContextMenu?: (event: React.MouseEvent, index: number, item: T) => void;
}
export interface VirtualListProps<T> extends VirtualListEvents<T> {
  itemSize: number | ((index: number) => number);
  items: readonly T[];
  getItemKey: (item: T) => string;
  children: (props: { index: number; item: T }) => React.ReactNode;
}

export interface VirtualListMethods {
  scrollToItem: (index: number) => void;
}

const useRowEventHandler = <T,>(
  items: readonly T[],
  handler?: (event: React.MouseEvent, index: number, item: T) => void
) => {
  return useMemo(() => {
    if (!handler) {
      return undefined;
    }
    return (event: React.MouseEvent) => {
      const index = parseInt((event.currentTarget as HTMLElement).dataset.index || "-1");
      if (0 <= index) {
        handler(event, index, items[index]);
      }
    };
  }, [items, handler]);
};

const VirtualListInner = <T,>(
  {
    itemSize,
    items,
    getItemKey,
    children,
    onRowClick,
    onRowMouseDown,
    onRowDoubleClick,
    onRowContextMenu
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<VirtualListMethods>
) => {
  const listRef = useRef<FixedSizeList & VariableSizeList>(null);
  useImperativeHandle(ref, () => ({
    scrollToItem: (index) => {
      0 <= index && listRef.current?.scrollToItem(index);
    }
  }));
  useEffect(() => {
    listRef.current?.resetAfterIndex?.(0);
  }, [itemSize]);
  const handleRowClick = useRowEventHandler(items, onRowClick);
  const handleRowMouseDown = useRowEventHandler(items, onRowMouseDown);
  const handleRowDoubleClick = useRowEventHandler(items, onRowDoubleClick);
  const handleRowContextMenu = useRowEventHandler(items, onRowContextMenu);
  const renderRow = useCallback(
    ({ index, style }: { index: number; style: object }) => {
      const item = items[index];
      return (
        <div
          data-index={index}
          key={getItemKey(item)}
          style={style}
          onClick={handleRowClick}
          onMouseDown={handleRowMouseDown}
          onDoubleClick={handleRowDoubleClick}
          onContextMenu={handleRowContextMenu}
        >
          {children({ index, item })}
        </div>
      );
    },
    [
      items,
      getItemKey,
      handleRowClick,
      handleRowMouseDown,
      handleRowDoubleClick,
      handleRowContextMenu,
      children
    ]
  );
  const itemKey = useCallback(
    (index: number, data: unknown) => {
      return getItemKey((data as T[])[index]);
    },
    [getItemKey]
  );

  const props = {
    ref: listRef,
    itemCount: items.length,
    itemData: items,
    itemKey,
    children: renderRow,
    overscanCount: 8
  };
  return (
    <AutoSizer className="flex-1">
      {(size) =>
        typeof itemSize === "number" ? (
          <MemoizedFixedSizeList itemSize={itemSize} {...props} {...size} />
        ) : (
          <MemoizedVariableSizeList itemSize={itemSize} {...props} {...size} />
        )
      }
    </AutoSizer>
  );
};

export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.ForwardedRef<VirtualListMethods> }
) => ReturnType<typeof VirtualListInner>;
