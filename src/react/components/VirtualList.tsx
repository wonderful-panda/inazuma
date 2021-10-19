import classNames from "classnames";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import KeyboardSelection from "./KeyboardSelection";
import { useSelectedIndex, useSelectedIndexHandler } from "@/hooks/useSelectedIndex";

const MemoizedFixedSizeList = memo(FixedSizeList);
const MemoizedVariableSizeList = memo(VariableSizeList);

export interface VirtualListProps<T> {
  itemSize: number | ((index: number) => number);
  items: readonly T[];
  getItemKey: (item: T) => string;
  tabIndex?: number;
  className?: string;
  children: (props: { index: number; item: T }) => React.ReactNode;
  onRowClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, item: T) => void;
}

export interface VirtualListHandler {
  focus: () => void;
  scrollToItem: (index: number) => void;
}

const createRowEventHandler = <T extends unknown>(
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

const VirtualList = <T extends unknown>({
  itemSize,
  items,
  getItemKey,
  className,
  tabIndex = 0,
  children,
  onRowClick: onRowClick_,
  onRowDoubleClick
}: VirtualListProps<T>) => {
  const selectedIndex = useSelectedIndex();
  const selectedIndexHandler = useSelectedIndexHandler();
  const listRef = useRef<FixedSizeList & VariableSizeList>(null);
  useEffect(() => {
    listRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);
  const onRowClick = useCallback(
    (event: React.MouseEvent, index: number, item: T) => {
      if (event.button === 0) {
        selectedIndexHandler.set(index);
      }
      onRowClick_?.(event, index, item);
    },
    [onRowClick_, selectedIndexHandler]
  );
  const handleRowClick = createRowEventHandler(items, onRowClick);
  const handleRowDoubleClick = createRowEventHandler(items, onRowDoubleClick);
  const renderRow = useCallback(
    ({ index, style }: { index: number; style: object }) => {
      const item = items[index];
      return (
        <div
          data-index={index}
          key={getItemKey(item)}
          style={style}
          onClick={handleRowClick}
          onDoubleClick={handleRowDoubleClick}
        >
          {children({ index, item })}
        </div>
      );
    },
    [items, getItemKey, handleRowClick, handleRowDoubleClick, children]
  );

  const props = {
    ref: listRef,
    itemCount: items.length,
    children: renderRow,
    overscanCount: 8
  };
  return (
    <KeyboardSelection className={classNames("flex flex-1", className)} tabIndex={tabIndex}>
      <AutoSizer className="flex-1">
        {(size) =>
          typeof itemSize === "number" ? (
            <MemoizedFixedSizeList itemSize={itemSize} {...props} {...size} />
          ) : (
            <MemoizedVariableSizeList itemSize={itemSize} {...props} {...size} />
          )
        }
      </AutoSizer>
    </KeyboardSelection>
  );
};

export default VirtualList;
