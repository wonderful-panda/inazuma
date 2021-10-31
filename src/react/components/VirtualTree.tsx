import { TreeItem } from "@/tree";
import classNames from "classnames";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo
} from "react";
import { CustomSelectedIndexProvider } from "@/context/SelectedIndexContext";
import VirtualList, { VirtualListEvents } from "./VirtualList";
import useVirtualTreeRecucer from "./VirtualTreeReducer";

export interface VirtualTreeMethods<T> {
  expand: (item: TreeItem<T>) => void;
  collapse: (item: TreeItem<T>) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export interface VirtualTreeProps<T> extends VirtualListEvents<VisibleItem<T>> {
  rootItems: TreeItem<T>[];
  itemSize: number;
  getItemKey: (data: T) => string;
  renderRow: (item: TreeItem<T>, index: number, expanded: boolean) => React.ReactNode;
  className?: string;
}

export interface VisibleItem<T> {
  item: TreeItem<T>;
  parent: VisibleItem<T> | undefined;
  level: number;
  expanded: boolean;
}

const ExpandButton: React.VFC<{ expanded: boolean; size: number }> = ({ expanded, size }) => (
  <svg
    width={size}
    height={size}
    className={classNames("my-auto cursor-pointer", expanded && "rotate-90")}
  >
    <polygon
      transform={`translate(${size / 2}, ${size / 2})`}
      points="-1,-4 3,0 -1,4"
      fill="white"
    />
  </svg>
);

const VirtualTreeRowInner = (props: {
  height: number;
  item: TreeItem<any>;
  index: number;
  level: number;
  expanded: boolean;
  renderRow: (item: TreeItem<any>, index: number, expanded: boolean) => React.ReactNode;
  toggleExpand: (item: TreeItem<any>) => void;
}) => {
  const { height, item, index, level, expanded, renderRow, toggleExpand } = props;
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpand(item);
    },
    [item, toggleExpand]
  );
  const indent = 16 * level;
  return (
    <div className="flex-row-nowrap my-auto mx-0.5 items-center" style={{ height }}>
      <div
        className="flex my-auto"
        style={{ height, marginLeft: indent, minWidth: 20 }}
        onClick={onClick}
      >
        {item.children && <ExpandButton expanded={expanded} size={20} />}
      </div>
      {renderRow(item, index, expanded)}
    </div>
  );
};
const VirtualTreeRow = memo(VirtualTreeRowInner);

const VirtualTreeInner = <T extends unknown>(
  { rootItems, itemSize, getItemKey, renderRow, ...rest }: VirtualTreeProps<T>,
  ref: React.ForwardedRef<VirtualTreeMethods<T>>
) => {
  const [state, dispatch] = useVirtualTreeRecucer<T>();
  useLayoutEffect(() => {
    dispatch({ type: "reset", payload: { items: rootItems, getItemKey } });
  }, [rootItems, getItemKey, dispatch]);

  useImperativeHandle(ref, () => ({
    expand: (item) => dispatch({ type: "expandItem", payload: item }),
    collapse: (item) => dispatch({ type: "collapseItem", payload: item }),
    expandAll: () => dispatch({ type: "expandAll" }),
    collapseAll: () => dispatch({ type: "collapseAll" })
  }));

  const toggleExpand = useCallback(
    (item: TreeItem<T>) => {
      dispatch({ type: "toggleItem", payload: item });
    },
    [dispatch]
  );
  const getItemKey_ = useCallback(
    (item: VisibleItem<T>) => getItemKey(item.item.data),
    [getItemKey]
  );
  const setSelectedIndex = useCallback(
    (payload: React.SetStateAction<number>) => dispatch({ type: "setSelectedIndex", payload }),
    [dispatch]
  );
  const children = useCallback(
    ({ index, item: { item, expanded, level } }: { index: number; item: VisibleItem<T> }) => (
      <VirtualTreeRow
        height={itemSize}
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
  const extraKeyboardHandlers = useMemo(() => {
    return {
      ArrowLeft: () => {
        const vitem = state.selectedItem;
        if (!vitem) {
          return;
        }
        if (vitem.item.children && vitem.expanded) {
          // collapse
          dispatch({ type: "collapseItem", payload: vitem.item });
        } else {
          // select parent item
          if (vitem.parent) {
            dispatch({ type: "setSelectedItem", payload: vitem.parent });
          }
        }
      },
      ArrowRight: () => {
        const vitem = state.selectedItem;
        if (!vitem) {
          return;
        }
        if (vitem.item.children) {
          if (vitem.expanded) {
            // select first child
            dispatch({ type: "setSelectedIndex", payload: (v) => v + 1 });
          } else {
            // expand
            dispatch({ type: "expandItem", payload: vitem.item });
          }
        }
      }
    };
  }, [state.selectedItem, dispatch]);

  return (
    <CustomSelectedIndexProvider
      itemsCount={state.visibleItems.length}
      value={state.selectedIndex}
      setValue={setSelectedIndex}
    >
      <VirtualList<VisibleItem<T>>
        items={state.visibleItems}
        itemSize={itemSize}
        getItemKey={getItemKey_}
        extraKeyboardHandler={extraKeyboardHandlers}
        {...rest}
      >
        {children}
      </VirtualList>
    </CustomSelectedIndexProvider>
  );
};

const VirtualTree = forwardRef(VirtualTreeInner) as <T>(
  props: VirtualTreeProps<T> & { ref?: React.ForwardedRef<VirtualTreeMethods<T>> }
) => ReturnType<typeof VirtualTreeInner>;

export default VirtualTree;
