import { useTheme } from "@mui/material";
import classNames from "classnames";
import { useCallback } from "react";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { getFileName } from "@/util";
import { VirtualTree, type VirtualTreeProps } from "../VirtualTree";

export interface LsTreeProps
  extends Omit<VirtualTreeProps<LstreeData>, "getItemKey" | "itemSize" | "renderRow"> {
  getRowClass?: (item: LstreeData) => string | undefined;
}

const getItemKey = (item: LstreeData) => item.path;

const LsTreeRow: React.FC<{
  item: LstreeEntry;
  index: number;
  getRowClass?: (item: LstreeData) => string | undefined;
}> = ({ item, index, getRowClass }) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "flex-1 min-h-full flex items-center px-2 cursor-default whitespace-nowrap overflow-hidden hover:bg-hoverHighlight",
        index === selectedIndex && "bg-highlight",
        getRowClass?.(item.data)
      )}
    >
      {getFileName(item.data.path)}
    </div>
  );
};

export const LsTree: React.FC<LsTreeProps> = ({ getRowClass, ...rest }) => {
  const theme = useTheme();
  const itemSize = theme.custom.baseFontSize * 2;
  const renderRow = useCallback(
    (item: LstreeEntry, index: number) => (
      <LsTreeRow item={item} index={index} getRowClass={getRowClass} />
    ),
    [getRowClass]
  );
  return (
    <VirtualTree<LstreeData>
      getItemKey={getItemKey}
      itemSize={itemSize}
      renderRow={renderRow}
      {...rest}
    />
  );
};
