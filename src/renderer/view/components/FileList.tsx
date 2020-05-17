import * as vca from "vue-tsx-support/lib/vca";
import { vlistOf, VtableEventsOn, RowClickEventArgs } from "vue-vtable";
import { css } from "emotion";
import { required, optional } from "./base/prop";
import { ref } from "@vue/composition-api";
import { Octicon } from "./Octicon";
import { VNode } from "vue/types/umd";
import VIconButton from "./base/VIconButton";
import { withClass } from "./base/withClass";

const Vlist = vlistOf<FileEntry>();

const rootStyle = css`
  display: flex;
  position: relative;
  margin: 2px !important;
  background-color: #282828 !important;
  flex: 1;

  .vlist-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex: 1;
  }
  .vlist-scrollable {
    width: 100%;
  }

  .vlist-row {
    user-select: none;
    width: 100%;
    cursor: default;
    &:hover {
      background-color: #4c4c4c;
    }
  }

  .vlist-content {
    flex: 1;
  }
`;

const headerStyle = css`
  padding: 8px 16px !important;
  user-select: none;
  width: 100%;
  border-bottom: 1px solid #444;
`;

const rowStyle = css`
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

  .paths {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding-left: 4px;
    flex-flow: column nowrap;
  }
  .path {
    font-family: var(--monospace-fontfamily);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .path-normal {
    font-size: 14px;
    line-height: 32px;
  }
  .path-renamed-new {
    font-size: 14px;
    line-height: 14px;
  }
  .renamed-old {
    display: flex;
    flex-flow: row nowrap;
    line-height: 14px;
    font-size: 14px;
    opacity: 0.5;
  }
`;

const diffIconStyle = css`
  margin: auto 4px auto 8px;
`;

export type FileAction = {
  icon: string;
  action: (item: FileEntry) => void;
  enabled?: (item: FileEntry) => boolean;
  tooltip?: string;
};

const FileActionButton = withClass(VIconButton, "file-action-button");

const getDiffIcon = (statusCode: string): VNode => {
  switch (statusCode) {
    case "M":
      return (
        <Octicon class={diffIconStyle} name="diff-modified" color="orange" />
      );
    case "A":
    case "?":
      return (
        <Octicon class={diffIconStyle} name="diff-added" color="lightgreen" />
      );
    case "D":
      return (
        <Octicon class={diffIconStyle} name="diff-removed" color="magenta" />
      );
    default:
      return <Octicon class={diffIconStyle} name="diff-renamed" color="cyan" />;
  }
};

const Row = _fc<{ item: FileEntry; actions?: readonly FileAction[] }>(
  ({ props: { item, actions } }) => {
    const renamed = item.statusCode.startsWith("R");
    return (
      <div class={rowStyle}>
        {getDiffIcon(item.statusCode)}
        <div class="paths">
          <div
            class={["path", renamed ? "path-renamed-new" : "path-normal"]}
            title={item.path}
          >
            {item.path}
          </div>
          {renamed && (
            <div class="renamed-old">
              <Octicon name="line-arrow-left" color="white" size={16} />
              <div class="path" title={item.oldPath}>
                {item.oldPath}
              </div>
            </div>
          )}
        </div>
        {actions && (
          <div class="file-action-buttons">
            {actions.map((a, index) => (
              <FileActionButton
                key={index}
                action={() => a.action(item)}
                tooltip={a.tooltip}
                disabled={a.enabled && !a.enabled(item)}
              >
                {a.icon}
              </FileActionButton>
            ))}
          </div>
        )}
      </div>
    );
  }
);

// @vue/component
export default vca.component({
  name: "FileTable",
  props: {
    files: required<readonly FileEntry[]>(Array),
    actions: optional<readonly FileAction[]>(Array),
    title: optional(String)
  },
  setup(p, ctx: vca.SetupContext<VtableEventsOn<FileEntry>>) {
    const selectedFile = ref("");
    const getFileKey = (item: FileEntry) => item.path;
    const getRowClass = (item: FileEntry) =>
      item.path === selectedFile.value ? "vlist-row-selected" : "vlist-row";
    const onRowclick = (arg: RowClickEventArgs<FileEntry>) => {
      selectedFile.value = arg.item.path;
    };
    const sliceItems = (begin: number, end: number) =>
      p.files.slice(begin, end);
    return () => (
      <md-card staticClass={rootStyle}>
        <Vlist
          itemCount={p.files.length}
          sliceItems={sliceItems}
          getItemKey={getFileKey}
          rowHeight={36}
          contentWidth={0}
          scopedSlots={{
            row: ({ item }) => (
              <Row class={getRowClass(item)} item={item} actions={p.actions} />
            )
          }}
          onRowclick={onRowclick}
          {...{ on: ctx.listeners }}
        >
          {p.title && (
            <h2 class={["md-title", headerStyle]} slot="header">
              {p.title}
            </h2>
          )}
        </Vlist>
      </md-card>
    );
  }
});
