import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { getFileName } from "@/util";
import classNames from "classnames";
import { forwardRef, useCallback } from "react";
import VirtualTree, { VirtualTreeMethods } from "../VirtualTree";

export interface LsTreeProps {
  entries: readonly LstreeEntry[];
  fontSize: FontSize;
}

type Data = LstreeEntry["data"];

export type LsTreeMethods = VirtualTreeMethods<Data>;

const getItemKey = (item: Data) => item.path;

const LsTreeRow: React.VFC<{ item: LstreeEntry; index: number }> = ({ item, index }) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "flex-1 min-h-full flex items-center px-2 cursor-default",
        index === selectedIndex && "bg-highlight"
      )}
    >
      {getFileName(item.data.path)}
    </div>
  );
};

const LsTree: React.ForwardRefRenderFunction<LsTreeMethods, LsTreeProps> = (
  { entries, fontSize },
  ref
) => {
  const renderRow = useCallback(
    (item: LstreeEntry, index: number) => <LsTreeRow item={item} index={index} />,
    []
  );
  return (
    <VirtualTree<Data>
      ref={ref}
      className="flex-1"
      rootItems={entries}
      getItemKey={getItemKey}
      itemSize={fontSize === "medium" ? 32 : 24}
      renderRow={renderRow}
    />
  );
};

export default forwardRef(LsTree);
