import { Button } from "@material-ui/core";
import { memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import GitHash from "../GitHash";
import SplitterPanel from "../SplitterPanel";
import { formatDateLLL } from "@/date";
import RefBadge from "./RefBadge";
import FlexCard from "../FlexCard";
import { usePersistState } from "@/hooks/usePersistState";
import { getFileName, shortHash } from "@/util";
import { useDispatch } from "@/store";
import { ADD_TAB } from "@/store/repository";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import FileList from "./FileList";

export interface CommitDetailProps {
  commit: CommitDetail | undefined;
  refs: Ref[];
  orientation: Orientation;
}

const CommitMetadata: React.VFC<CommitDetailProps> = memo(({ commit, refs }) => {
  if (!commit) {
    return <FlexCard />;
  }

  const content = (
    <>
      <div className="border-b mb-1 border-solid border-current text-2xl">{commit.summary}</div>
      <div className="flex-row-wrap mb-1 text-greytext text-lg">
        <div className="flex-row-nowrap mr-4">
          <GitHash hash={commit.id} />
        </div>
        <div className="flex-row-nowrap mr-4">
          <Icon className="mr-0.5 my-auto" icon="mdi:account" />
          {commit.author}
        </div>
        <div className="flex-row-nowrap mr-4">
          <Icon className="mr-0.5 my-auto" icon="mdi:clock-outline" />
          {formatDateLLL(commit.date)}
        </div>
      </div>
      <div className="flex-row-wrap my-1">
        {refs.map((r) => (
          <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
        ))}
      </div>
      {commit.body && (
        <pre className="flex-initial m-1 p-2 overflow-auto text-lg whitespace-pre-wrap font-normal">
          {commit.body}
        </pre>
      )}
    </>
  );
  return (
    <FlexCard
      content={content}
      actions={
        <>
          <Button disabled={!commit}>Browse source</Button>
        </>
      }
    />
  );
});

const CommitDetail: React.VFC<CommitDetailProps> = (props) => {
  const dispatch = useDispatch();
  const [splitterRatio, setSplitterRatio] = usePersistState(
    "repository/CommitDetail/splitter.ratio",
    0.5
  );
  const commit = props.commit;
  const addBlameTab = useCallback(
    (_1: React.UIEvent, _2: number, file: FileEntry) => {
      if (!commit) {
        return;
      }
      if (file.statusCode === "D") {
        return;
      }
      dispatch(
        ADD_TAB({
          type: "file",
          id: `blame:${commit.id}/${file.path}`,
          title: `${getFileName(file.path)} @ ${shortHash(commit.id)}`,
          payload: { path: file.path, sha: commit.id },
          closable: true
        })
      );
    },
    [commit]
  );

  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={props.orientation === "portrait" ? "vert" : "horiz"}
      first={<CommitMetadata {...props} />}
      second={
        <FlexCard
          title={commit && "Changes"}
          content={
            commit && (
              <SelectedIndexProvider itemsCount={commit.files.length || 0}>
                <FileList files={commit.files} onRowDoubleClick={addBlameTab} />
              </SelectedIndexProvider>
            )
          }
        />
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(CommitDetail);
