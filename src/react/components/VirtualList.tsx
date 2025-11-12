import { memo, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { List, type ListImperativeAPI } from "react-window";

const MemoizedList = memo(List);

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
  const listRef = useRef<ListImperativeAPI>(null);
  useImperativeHandle(ref, () => ({
    scrollToItem: (index) => {
      if (0 <= index) {
        listRef.current?.scrollToRow({ index });
      }
    }
  }));

  const handleRowClick = useRowEventHandler(items, onRowClick);
  const handleRowMouseDown = useRowEventHandler(items, onRowMouseDown);
  const handleRowDoubleClick = useRowEventHandler(items, onRowDoubleClick);
  const handleRowContextMenu = useRowEventHandler(items, onRowContextMenu);
  const handleRowDragEnter = useRowEventHandler(items, onRowDragEnter);
  const handleRowDragLeave = useRowEventHandler(items, onRowDragLeave);
  const handleRowDragOver = useRowEventHandler(items, onRowDragOver);
  const handleRowDrop = useRowEventHandler(items, onRowDrop);

  // Row component for react-window v2
  const RowComponent = useCallback(
    ({
      index,
      style,
      ariaAttributes
    }: {
      index: number;
      style: React.CSSProperties;
      ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
    }) => {
      const item = items[index];
      // row must be unfocusable.
      // because there is a problemaic behavior when focused row scrolled out
      if (item === undefined) {
        return <div {...ariaAttributes} style={style} />;
      }
      return (
        <div
          {...ariaAttributes}
          data-index={index}
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
      );
    },
    [
      items,
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

  return (
    <div className="relative flex-1 grid grid-row-1 grid-col-1 overflow-hidden">
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <MemoizedList
          listRef={listRef}
          rowCount={items.length}
          rowHeight={itemSize}
          rowComponent={RowComponent}
          rowProps={{}}
          overscanCount={8}
        />
      </div>
    </div>
  );
};

export const VirtualList = VirtualListInner;
