import { useErrorReporter } from "@/hooks/useAlert";
import { useDispatch, useSelector, RootState } from "@/store";
import { selectLogEntry } from "@/store/repository";
import { useCallback, useState } from "react";
import { SplitterDirection } from "../Splitter";
import SplitterPanel from "../SplitterPanel";
import CommitDetail from "./CommitDetail";
import CommitList from "./CommitList";
import { createSelector } from "reselect";
import styled from "styled-components";
import WorkingTree from "./WorkingTree";

const Panel = styled.div`
  padding: 0.5rem;
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const emptyRefs: Ref[] = [];

const entrySelector = (state: RootState) => state.repository.selectedLogEntry;
const refsSelector = (state: RootState) => state.repository.refs;
const currentRefsSelector = createSelector(
  entrySelector,
  refsSelector,
  (entry, refs) => (entry && refs.refsById[entry.id]) || emptyRefs
);

const CommitLog: React.VFC = () => {
  const commits = useSelector((state) => state.repository.commits);
  const graph = useSelector((state) => state.repository.graph);
  const selectedIndex = useSelector((state) => state.repository.selectedLogIndex);
  const refs = useSelector(refsSelector);
  const currentEntry = useSelector(entrySelector);
  const currentRefs = useSelector(currentRefsSelector);
  const errorReporter = useErrorReporter();
  const handleRowclick = useCallback((_: React.MouseEvent, index: number) => {
    dispatch(selectLogEntry({ index, errorReporter }));
  }, []);
  const dispatch = useDispatch();
  const [ratio, setRatio] = useState(0.6);
  const [direction, setDirection] = useState<SplitterDirection>("horiz");
  const orientation = direction === "horiz" ? "portrait" : "landscape";
  return (
    <SplitterPanel
      direction={direction}
      splitterThickness={5}
      ratio={ratio}
      allowDirectionChange
      onUpdateRatio={setRatio}
      onUpdateDirection={setDirection}
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
      first={
        <Panel>
          <CommitList
            commits={commits}
            graph={graph}
            refs={refs}
            selectedIndex={selectedIndex}
            onRowclick={handleRowclick}
          />
        </Panel>
      }
      second={
        <Panel>
          {currentEntry === undefined || currentEntry.type === "commit" ? (
            <CommitDetail commit={currentEntry} refs={currentRefs} orientation={orientation} />
          ) : (
            <WorkingTree stat={currentEntry} orientation={orientation} />
          )}
        </Panel>
      }
    />
  );
};

export default CommitLog;
