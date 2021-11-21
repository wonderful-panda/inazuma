import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { TreeItemVM, TreeModelDispatch, TreeModelState } from "@/hooks/useTreeModel";
import { getFileName } from "@/util";
import { useTheme } from "@material-ui/core";
import classNames from "classnames";
import { useCallback } from "react";
import { VirtualListEvents } from "../VirtualList";
import { VirtualTree } from "../VirtualTree";

export interface LsTreeProps extends VirtualListEvents<TreeItemVM<LstreeEntryData>> {
  treeModelState: TreeModelState<LstreeEntryData>;
  treeModelDispatch: TreeModelDispatch<LstreeEntryData>;
  getRowClass?: (item: LstreeEntryData) => string | undefined;
}

const getItemKey = (item: LstreeEntryData) => item.path;

const LsTreeRow: React.VFC<{
  item: LstreeEntry;
  index: number;
  getRowClass?: (item: LstreeEntryData) => string | undefined;
}> = ({ item, index, getRowClass }) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "flex-1 min-h-full flex items-center px-2 cursor-default whitespace-nowrap overflow-hidden",
        index === selectedIndex && "bg-highlight",
        getRowClass && getRowClass(item.data)
      )}
    >
      {getFileName(item.data.path)}
    </div>
  );
};

export const LsTree: React.VFC<LsTreeProps> = ({
  treeModelState,
  treeModelDispatch,
  getRowClass,
  ...rest
}) => {
  const theme = useTheme();
  const itemSize = theme.custom.baseFontSize * 2;
  const renderRow = useCallback(
    (item: LstreeEntry, index: number) => (
      <LsTreeRow item={item} index={index} getRowClass={getRowClass} />
    ),
    [getRowClass]
  );
  return (
    <VirtualTree<LstreeEntryData>
      treeModelState={treeModelState}
      treeModelDispatch={treeModelDispatch}
      getItemKey={getItemKey}
      itemSize={itemSize}
      renderRow={renderRow}
      {...rest}
    />
  );
};
