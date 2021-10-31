import browserApi from "@/browserApi";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { useDispatch } from "@/store";
import { SHOW_ERROR } from "@/store/misc";
import { sortTreeInplace } from "@/tree";
import { getFileName, serializeError } from "@/util";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import Loading from "../Loading";
import VirtualTree from "../VirtualTree";

export interface SourceTreeProps {
  repoPath: string;
  sha: string;
  fontSize: FontSize;
}

type Data = LstreeEntry["data"];

const getItemKey = (item: Data) => item.path;

const SourceTreeRow: React.VFC<{ item: LstreeEntry; index: number }> = ({ item, index }) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "flex-1 min-h-full flex items-center px-2",
        index === selectedIndex && "bg-highlight"
      )}
    >
      {getFileName(item.data.path)}
    </div>
  );
};

const SourceTree: React.VFC<SourceTreeProps> = ({ repoPath, sha, fontSize }) => {
  const [entries, setEntries] = useState<LstreeEntry[]>([]);
  const dispatch = useDispatch();
  useEffect(() => {
    browserApi
      .getTree({ repoPath, sha })
      .then((entries) => {
        sortTreeInplace(entries, (a, b) => {
          if (a.data.type !== b.data.type) {
            return a.data.type === "tree" ? -1 : 1;
          } else {
            return a.data.path.localeCompare(b.data.path);
          }
        });
        setEntries(entries);
      })
      .catch((e) => {
        dispatch(SHOW_ERROR({ error: serializeError(e) }));
      });
  }, [repoPath, sha, dispatch]);
  const renderRow = useCallback(
    (item: LstreeEntry, index: number) => <SourceTreeRow item={item} index={index} />,
    []
  );
  return entries ? (
    <VirtualTree<Data>
      className="flex-1"
      rootItems={entries}
      getItemKey={getItemKey}
      itemSize={fontSize === "medium" ? 32 : 24}
      renderRow={renderRow}
    />
  ) : (
    <Loading open />
  );
};

export default SourceTree;
