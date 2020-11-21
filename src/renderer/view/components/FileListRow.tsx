import { css } from "@emotion/css";
import { FileListIcon } from "./FileListIcon";
import { withclass } from "./base/withClass";
import VIconButton from "./base/VIconButton";
import { MonoDiv } from "./base/mono";
import { FileCommand } from "view/commands/types";
import { executeFileCommand } from "view/commands";
import { MdButton, MdIcon, MdTooltip } from "./base/md";

export const RowHeight = 42;

const Container = withclass.div(
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
      height: 28px;
      padding: 2px 4px;
      border-radius: 14px;
      right: 4px;
      bottom: 4px;
      opacity: 0;
      background-color: #333;
    }
    .file-action-button {
      max-width: 22px !important;
      max-height: 22px !important;
      min-width: 22px !important;
      min-height: 22px !important;
      font-size: 14px;
      margin: auto 4px;
    }
    :hover .file-action-buttons {
      opacity: 1;
    }
  `
);

const RowContent = withclass(MonoDiv)(
  css`
    display: flex;
    flex: 1;
    overflow: hidden;
    padding-left: 4px;
    flex-flow: column nowrap;
  `
);

const FirstLine = withclass.div(
  css`
    display: flex;
    flex-flow: row nowrap;
    margin: 2px 0px;
    font-size: 14px;
    line-height: 18px;
    height: 18px;
  `
);

const SecondLine = withclass.div(
  css`
    display: flex;
    flex-flow: row nowrap;
    margin: auto 0px;
    font-size: 12px;
    line-height: 16px;
    height: 18px;
  `
);

const FileType = withclass.div(
  css`
    font-weight: bold;
    padding: 0 2px;
    color: #888;
    margin: auto 4px;
    text-transform: uppercase;
  `
);

const NumStat = withclass.div<{ mode: "-" | "+" }>(
  (p) => css`
    color: ${p.mode === "+" ? "lightgreen" : "hotpink"};
    margin: auto 4px;
    :before {
      content: "${p.mode}";
    }
  `
);

const NewPath = withclass.div(
  css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `
);

const OldPath = withclass.div<{ statusCode: string }>(
  (p) => css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #aaa;
    :before {
      content: "${p.statusCode.startsWith("R") ? "Rename" : "Copy"} from";
      font-weight: bold;
      padding: 0 2px;
      color: #222;
      background: #888;
      margin: auto 4px;
    }
  `
);

const isNumberStat = (stat: "-" | number | undefined) => stat !== undefined && stat !== "-";

const getFileType = (item: FileEntry) => {
  if (item.insertions === undefined) {
    return "unknown";
  } else if (item.insertions === "-") {
    return "binary";
  } else {
    return "text";
  }
};

const FileActionButtons = _fc<{
  item: FileEntry;
  commit: Commit;
  buttons?: readonly FileCommand[];
  menus?: readonly FileCommand[];
}>(({ props: { item, commit, buttons, menus } }) => {
  const buttonNodes = (buttons || []).map((a, index) => (
    <VIconButton
      class="file-action-button"
      key={index}
      disabled={a.isEnabled && !a.isEnabled(commit, item, item.path)}
      action={() => executeFileCommand(a, commit, item, item.path)}
      tooltip={a.label}
    >
      {a.icon}
    </VIconButton>
  ));
  if (menus) {
    const menuNodes = menus.map((m, index) => (
      <md-menu-item
        key={index}
        disabled={m.isEnabled && !m.isEnabled(commit, item, item.path)}
        onClick={() => executeFileCommand(m, commit, item, item.path)}
      >
        {m.label}
      </md-menu-item>
    ));
    buttonNodes.push(
      <md-menu key="other-actions" md-close-on-click md-align-trigger md-size="auto">
        <MdButton class="md-icon-button file-action-button" md-menu-trigger>
          <MdIcon>more_vert</MdIcon>
          <MdTooltip>Other actions</MdTooltip>
        </MdButton>
        <md-menu-content>{menuNodes}</md-menu-content>
      </md-menu>
    );
  }

  return <div staticClass="file-action-buttons">{buttonNodes}</div>;
});

export const FileListRow = _fc<{
  item: FileEntry;
  commit: Commit;
  buttons?: readonly FileCommand[];
  menus?: readonly FileCommand[];
}>(({ props: { item, commit, buttons, menus } }) => {
  return (
    <Container>
      <FileListIcon statusCode={item.statusCode} />
      <RowContent>
        <FirstLine>
          <NewPath title={item.path}>{item.path}</NewPath>
        </FirstLine>
        <SecondLine>
          <FileType>{getFileType(item)}</FileType>
          {isNumberStat(item.insertions) && <NumStat mode="+">{item.insertions}</NumStat>}
          {isNumberStat(item.deletions) && <NumStat mode="-">{item.deletions}</NumStat>}
          {item.oldPath && <OldPath statusCode={item.statusCode}>{item.oldPath}</OldPath>}
        </SecondLine>
      </RowContent>
      {(buttons || menus) && (
        <FileActionButtons commit={commit} item={item} buttons={buttons} menus={menus} />
      )}
    </Container>
  );
});
