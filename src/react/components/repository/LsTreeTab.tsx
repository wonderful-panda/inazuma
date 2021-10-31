import browserApi from "@/browserApi";
import { useDispatch } from "@/store";
import { SHOW_ERROR } from "@/store/misc";
import { filterTreeItems, sortTreeInplace } from "@/tree";
import { serializeError } from "@/util";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SplitterPanel from "../PersistSplitterPanel";
import Loading from "../Loading";
import LsTree, { LsTreeMethods } from "./LsTree";
import { IconButton, TextField } from "@material-ui/core";
import { Icon } from "@iconify/react";
import { debounce } from "lodash";

export interface LsTreeTabProps {
  repoPath: string;
  sha: string;
  fontSize: FontSize;
}

const LsTreeWithFilter: React.VFC<{ fontSize: FontSize; entries: readonly LstreeEntry[] }> = ({
  fontSize,
  entries
}) => {
  const ref = useRef<LsTreeMethods>(null);
  const [filterText, setFilterText] = useState("");
  const onFilterTextChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.target.value);
      }, 500),
    []
  );
  const filteredEntries = useMemo(() => {
    if (!filterText) {
      return entries;
    }
    return filterTreeItems(entries, (data) => data.path.indexOf(filterText) >= 0);
  }, [entries, filterText]);
  const expandAll = useCallback(() => {
    ref.current?.expandAll();
  }, []);
  const collapseAll = useCallback(() => {
    ref.current?.collapseAll();
  }, []);
  return (
    <div className="flex-col-nowrap flex-1 m-1">
      <div className="flex-row-nowrap items-end mb-4 mr-2">
        <Icon icon="mdi:filter" className="text-2xl m-1" />
        <TextField label="Filter by path" className="flex-1" onChange={onFilterTextChange} />
        <IconButton size="small" onClick={expandAll} title="Expand all">
          <Icon icon="mdi:chevron-down" className="text-2xl" />
        </IconButton>
        <IconButton size="small" onClick={collapseAll} title="Collapse all">
          <Icon icon="mdi:chevron-up" className="text-2xl" />
        </IconButton>
      </div>
      <LsTree ref={ref} entries={filteredEntries} fontSize={fontSize} />
    </div>
  );
};

const LsTreeTab: React.VFC<LsTreeTabProps> = ({ repoPath, sha, fontSize }) => {
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

  return !entries ? (
    <Loading open />
  ) : (
    <SplitterPanel
      persistKey="repository/LsTreeTab"
      initialRatio={0.3}
      initialDirection="horiz"
      first={<LsTreeWithFilter entries={entries} fontSize={fontSize} />}
      second={<div />}
      allowDirectionChange
    />
  );
};

export default LsTreeTab;
