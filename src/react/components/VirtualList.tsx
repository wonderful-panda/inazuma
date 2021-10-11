import classNames from "classnames";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef } from "react";
import KeyboardSelection from "./KeyboardSelection";

export interface VirtualListProps<T> {
  itemSize: number | ((index: number) => number);
  items: readonly T[];
  getItemKey: (item: T) => string;
  selectedIndex: number;
  tabIndex?: number;
  onUpdateSelectedIndex: Dispatch<SetStateAction<number>>;
  className?: string;
  children: (props: { index: number; selectedIndex: number; item: T }) => React.ReactNode;
  onRowClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, item: T) => void;
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
  selectedIndex,
  onUpdateSelectedIndex,
  className,
  tabIndex = 0,
  children,
  onRowClick: onRowClick_,
  onRowDoubleClick
}: VirtualListProps<T>) => {
  const ref = useRef<FixedSizeList & VariableSizeList>(null);
  useEffect(() => {
    if (selectedIndex >= 0) {
      ref.current?.scrollToItem(selectedIndex);
    }
  }, [selectedIndex]);

  const onRowClick = useCallback(
    (event: React.MouseEvent, index: number, item: T) => {
      if (event.button === 0) {
        onUpdateSelectedIndex(index);
      }
      onRowClick_?.(event, index, item);
    },
    [onRowClick_, onUpdateSelectedIndex]
  );
  const handleRowClick = createRowEventHandler(items, onRowClick);
  const handleRowDoubleClick = createRowEventHandler(items, onRowDoubleClick);
  useEffect(() => {
    if (selectedIndex >= 0) {
      ref.current?.scrollToItem(selectedIndex);
    }
  }, [selectedIndex]);
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
          {children({ index, selectedIndex, item })}
        </div>
      );
    },
    [items, getItemKey, selectedIndex, handleRowClick, handleRowDoubleClick, children]
  );

  const props = {
    ref,
    itemCount: items.length,
    children: renderRow,
    overscanCount: 8
  };
  return (
    <KeyboardSelection
      className={classNames("flex flex-1", className)}
      itemsCount={items.length}
      tabIndex={tabIndex}
      setIndex={onUpdateSelectedIndex}
    >
      <AutoSizer className="flex-1">
        {({ width, height }) =>
          typeof itemSize === "number" ? (
            <FixedSizeList {...props} itemSize={itemSize} width={width} height={height} />
          ) : (
            <VariableSizeList {...props} itemSize={itemSize} width={width} height={height} />
          )
        }
      </AutoSizer>
    </KeyboardSelection>
  );
};

export default VirtualList;
