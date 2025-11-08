import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";

const MemoizedFixedSizeList = memo(FixedSizeList);
const MemoizedVariableSizeList = memo(VariableSizeList);

export interface VirtualListEvents<T> {
  onRowClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowMouseDown?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowContextMenu?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowDragEnter?: (event: React.DragEvent, index: number, item: T) => void;
  onRowDragLeave?: (event: React.DragEvent, index: number, item: T) => void;
  onRowDragOver?: (event: React.DragEvent, index: number, item: T) => void;
  onRowDrop?: (event: React.DragEvent, index: number, item: T) => void;
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

const useRowEventHandler = <T, E extends React.SyntheticEvent>(
  items: readonly T[],
  handler?: (event: E, index: number, item: T) => void
) => {
  return useMemo(() => {
    if (!handler) {
      return undefined;
    }
    return (event: E) => {
      const index = Number.parseInt((event.currentTarget as HTMLElement).dataset.index ?? "-1", 10);
      if (0 <= index && items[index] !== undefined) {
        handler(event, index, items[index]);
      }
    };
  }, [items, handler]);
};

const VirtualListInner = <T,>({
  itemSize,
  items,
  getItemKey,
  children,
  onRowClick,
  onRowMouseDown,
  onRowDoubleClick,
  onRowContextMenu,
  onRowDragEnter,
  onRowDragLeave,
  onRowDragOver,
  onRowDrop,
  ref
}: VirtualListProps<T> & { ref?: React.Ref<VirtualListMethods> }) => {
  const listRef = useRef<FixedSizeList & VariableSizeList>(null);
  useImperativeHandle(ref, () => ({
    scrollToItem: (index) => {
      if (0 <= index) {
        listRef.current?.scrollToItem(index);
      }
    }
  }));
  // biome-ignore lint/correctness/useExhaustiveDependencies(itemSize): itemSize changes should trigger list reset
  useEffect(() => {
    listRef.current?.resetAfterIndex?.(0);
  }, [itemSize]);
  const handleRowClick = useRowEventHandler(items, onRowClick);
  const handleRowMouseDown = useRowEventHandler(items, onRowMouseDown);
  const handleRowDoubleClick = useRowEventHandler(items, onRowDoubleClick);
  const handleRowContextMenu = useRowEventHandler(items, onRowContextMenu);
  const handleRowDragEnter = useRowEventHandler(items, onRowDragEnter);
  const handleRowDragLeave = useRowEventHandler(items, onRowDragLeave);
  const handleRowDragOver = useRowEventHandler(items, onRowDragOver);
  const handleRowDrop = useRowEventHandler(items, onRowDrop);
  const renderRow = useCallback(
    ({ index, style }: { index: number; style: object }) => {
      const item = items[index];
      return item !== undefined ? (
        <div
          role="row"
          tabIndex={-1}
          data-index={index}
          key={getItemKey(item)}
          style={style}
          onClick={handleRowClick}
          onMouseDown={handleRowMouseDown}
          onDoubleClick={handleRowDoubleClick}
          onContextMenu={handleRowContextMenu}
          onDragEnter={handleRowDragEnter}
          onDragLeave={handleRowDragLeave}
          onDragOver={handleRowDragOver}
          onDrop={handleRowDrop}
        >
          {children({ index, item })}
        </div>
      ) : null;
    },
    [
      items,
      getItemKey,
      handleRowClick,
      handleRowMouseDown,
      handleRowDoubleClick,
      handleRowContextMenu,
      handleRowDragEnter,
      handleRowDragLeave,
      handleRowDragOver,
      handleRowDrop,
      children
    ]
  );
  const itemKey = useCallback(
    (index: number, data: unknown) => {
      const item = (data as T[])[index];
      return item !== undefined ? getItemKey(item) : "";
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
    <AutoSizer className="flex-1" doNotBailOutOnEmptyChildren>
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

export const VirtualList = VirtualListInner;
