import * as vca from "vue-tsx-support/lib/vca";
import { vlistOf, VtableEventsOn, RowClickEventArgs } from "vue-vtable";
import { css } from "@emotion/css";
import { required, optional } from "./base/prop";
import { ref } from "@vue/composition-api";
import { FileListRow, RowHeight } from "./FileListRow";
import { FileCommand } from "view/commands/types";
import { normalizeListeners } from "core/utils";

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

// @vue/component
export default vca.component({
  name: "FileList",
  props: {
    commit: required<Commit>(),
    files: required<readonly FileEntry[]>(Array),
    buttons: optional<readonly FileCommand[]>(Array),
    menus: optional<readonly FileCommand[]>(Array),
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
    const sliceItems = (begin: number, end: number) => p.files.slice(begin, end);
    return () => {
      return (
        <md-card staticClass={rootStyle}>
          <Vlist
            itemCount={p.files.length}
            sliceItems={sliceItems}
            getItemKey={getFileKey}
            rowHeight={RowHeight}
            contentWidth={0}
            scopedSlots={{
              row: ({ item }) => (
                <FileListRow
                  class={getRowClass(item)}
                  commit={p.commit}
                  item={item}
                  buttons={p.buttons}
                  menus={p.menus}
                />
              )
            }}
            onRowclick={onRowclick}
            on={normalizeListeners(ctx)}
          >
            {p.title && (
              <h2 class={["md-title", headerStyle]} slot="header">
                {p.title}
              </h2>
            )}
          </Vlist>
        </md-card>
      );
    };
  }
});
