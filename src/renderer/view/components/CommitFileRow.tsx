import { css } from "emotion";
import { FileListIcon } from "./FileListIcon";
import { withClass } from "./base/withClass";
import VIconButton from "./base/VIconButton";
import { MonoDiv } from "./base/mono";
import { required } from "./base/prop";

export const RowHeight = 40;

const FileActionButtons = withClass("div", "file-action-buttons");

const Container = withClass(
  "div",
  css`
    padding: 2px 4px;
    overflow: hidden;
    display: flex;
    position: relative;
    flex: 1;
    flex-flow: row nowrap;
    border-bottom: 1px solid #444;
    .file-action-buttons {
      position: absolute;
      height: 26px;
      padding: 2px;
      border-radius: 4px;
      right: 2px;
      bottom: 2px;
      opacity: 0;
      background-color: #333;
    }
    .file-action-button {
      max-width: 22px !important;
      max-height: 22px !important;
      min-width: 22px !important;
      min-height: 22px !important;
      font-size: 14px;
      margin: auto 2px;
    }
    :hover .file-action-buttons {
      opacity: 1;
    }
  `
);

const RowContent = withClass(
  MonoDiv,
  css`
    display: flex;
    flex: 1;
    overflow: hidden;
    padding-left: 4px;
    flex-flow: column nowrap;
  `
);

const FirstLine = withClass(
  "div",
  css`
    display: flex;
    flex-flow: row nowrap;
    margin: auto 0px;
    font-size: 14px;
    line-height: 18px;
    height: 18px;
  `
);

const SecondLine = withClass(
  "div",
  css`
    display: flex;
    flex-flow: row nowrap;
    margin: auto 0px;
    font-size: 12px;
    line-height: 16px;
    height: 18px;
  `
);

const FileType = withClass(
  "div",
  css`
    color: #aaa;
    text-transform: uppercase;
    margin: auto 4px;
  `
);

const NumStat = withClass(
  "div",
  { mode: required<"-" | "+">() },
  p => css`
    color: ${p.mode === "+" ? "lightgreen" : "hotpink"};
    margin: auto 4px;
    :before {
      content: "${p.mode}";
    }
  `
);

const NewPath = withClass(
  "div",
  css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `
);

const OldPath = withClass(
  "div",
  { statusCode: required(String) },
  p => css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #aaa;
    :before {
      content: "${p.statusCode.startsWith("R") ? "rename" : "copy"}";
      padding: 0 2px;
      border: 1px solid #aaa;
      margin: auto 2px;
    }
  `
);
export type FileAction = {
  icon: string;
  action: (item: FileEntry) => void;
  enabled?: (item: FileEntry) => boolean;
  tooltip?: string;
};

const isNumberStat = (stat: "-" | number | undefined) =>
  stat !== undefined && stat !== "-";

const getFileType = (item: FileEntry) => {
  if (item.insertions === undefined) {
    return "unknown";
  } else if (item.insertions === "-") {
    return "binary";
  } else {
    return "text";
  }
};
export const CommitFileRow = _fc<{
  item: FileEntry;
  actions?: readonly FileAction[];
}>(({ props: { item, actions } }) => {
  return (
    <Container>
      <FileListIcon statusCode={item.statusCode} />
      <RowContent>
        <FirstLine>
          <NewPath title={item.path}>{item.path}</NewPath>
        </FirstLine>
        <SecondLine>
          <FileType>{getFileType(item)}</FileType>
          <NumStat mode="+" v-show={isNumberStat(item.insertions)}>
            {item.insertions}
          </NumStat>
          <NumStat mode="-" v-show={isNumberStat(item.deletions)}>
            {item.deletions}
          </NumStat>
          <OldPath v-show={item.oldPath} statusCode={item.statusCode}>
            {item.oldPath}
          </OldPath>
        </SecondLine>
      </RowContent>
      {actions && (
        <FileActionButtons>
          {actions.map((a, index) => (
            <VIconButton
              class="file-action-button"
              key={index}
              action={() => a.action(item)}
              tooltip={a.tooltip}
              disabled={a.enabled && !a.enabled(item)}
            >
              {a.icon}
            </VIconButton>
          ))}
        </FileActionButtons>
      )}
    </Container>
  );
});
