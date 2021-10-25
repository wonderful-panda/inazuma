import classNames from "classnames";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, VariableSizeList } from "react-window";
import {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import KeyboardSelection, { KeyboardSelectionMethods } from "./KeyboardSelection";
import { useSelectedIndex, useSelectedIndexMethods } from "@/hooks/useSelectedIndex";

const MemoizedFixedSizeList = memo(FixedSizeList);
const MemoizedVariableSizeList = memo(VariableSizeList);

export interface VirtualListEvents<T> {
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onRowClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, item: T) => void;
  onRowContextMenu?: (event: React.MouseEvent, index: number, item: T) => void;
}
export interface VirtualListProps<T> extends VirtualListEvents<T> {
  itemSize: number | ((index: number) => number);
  items: readonly T[];
  getItemKey: (item: T) => string;
  tabIndex?: number;
  className?: string;
  children: (props: { index: number; item: T }) => React.ReactNode;
}

export interface VirtualListMethods {
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

const VirtualListInner = <T extends unknown>(
  {
    itemSize,
    items,
    getItemKey,
    className,
    tabIndex = 0,
    children,
    onRowClick: onRowClick_,
    onRowDoubleClick,
    onRowContextMenu,
    onFocus,
    onBlur
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<VirtualListMethods>
) => {
  const selectedIndex = useSelectedIndex();
  const selectedIndexMethods = useSelectedIndexMethods();
  const wrapperRef = useRef<KeyboardSelectionMethods>(null);
  const listRef = useRef<FixedSizeList & VariableSizeList>(null);
  useImperativeHandle(ref, () => ({
    focus: () => wrapperRef.current?.focus(),
    scrollToItem: (index) => listRef.current?.scrollToItem(index)
  }));
  useEffect(() => {
    listRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);
  const onRowClick = useCallback(
    (event: React.MouseEvent, index: number, item: T) => {
      if (event.button === 0) {
        selectedIndexMethods.set(index);
      }
      onRowClick_?.(event, index, item);
    },
    [onRowClick_, selectedIndexMethods]
  );
  const handleRowClick = createRowEventHandler(items, onRowClick);
  const handleRowDoubleClick = createRowEventHandler(items, onRowDoubleClick);
  const handleRowContextMenu = createRowEventHandler(items, onRowContextMenu);
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
          onContextMenu={handleRowContextMenu}
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
    <KeyboardSelection
      ref={wrapperRef}
      className={classNames("flex flex-1 p-1", className)}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onBlur={onBlur}
    >
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

const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: ForwardedRef<VirtualListMethods> }
) => ReturnType<typeof VirtualListInner>;
export default VirtualList;
