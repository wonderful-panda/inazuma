import * as md from "view/utils/md-classes";
import * as vca from "vue-tsx-support/lib/vca";
import FileTable from "./FileTable";
import { __sync } from "view/utils/modifiers";
import { css } from "emotion";
import { showFileContextMenu, executeFileCommand } from "../commands";
import { fileCommandDiffWithParent } from "../commands/fileCommandDiff";
import { computed } from "@vue/composition-api";
import { GitHash } from "./GitHash";
import { formatDateL } from "core/utils";
import { injectStorage, useStorage } from "./injection/storage";
import { required } from "./base/prop";
import { Orientation } from "view/mainTypes";

const style = {
  container: (orientation: Orientation) => css`
    display: flex;
    flex: 1;
    flex-flow: ${orientation === "portrait" ? "column" : "row"} nowrap;
    padding: 12px;
  `,
  metadata: css`
    display: flex;
    min-width: 40%;
    flex-flow: column nowrap;
  `,
  inactive: css`
    color: #666;
  `,
  summary: css`
    padding: 4px;
    margin-bottom: 8px;
  `,
  attrTable: css`
    width: 100%;
    margin-bottom: 8px;
  `,
  attrName: css`
    background-color: #333;
    padding: 0 8px;
    vertical-align: middle;
    font-family: var(--monospace-fontfamily);
  `,
  attrValue: css`
    background-color: #333;
    padding: 0 8px;
    vertical-align: middle;
    font-family: var(--monospace-fontfamily);
    width: 100%;
  `,
  body: css`
    margin: 0px 2px 8px 8px;
    font-family: var(--default-fontfamily);
    min-height: 1em;
    max-height: 12em;
    white-space: pre-wrap;
    overflow: auto;
  `
};

const CommitAttr = _fc<{ name: string }>(({ props, children }) => (
  <tr>
    <td staticClass={style.attrName}>{props.name}</td>
    <td staticClass={style.attrValue}>{children}</td>
  </tr>
));

const CommitMetadata = _fc<{ commit: CommitDetail }>(
  ({ props: { commit } }) => (
    <div class={style.metadata}>
      <div class={[style.summary, md.TITLE]}>
        {commit.summary || "No commit selected"}
      </div>
      <pre v-show={commit.body} staticClass={style.body}>
        {commit.body}
      </pre>
      <table staticClass={style.attrTable}>
        <CommitAttr name="id">
          <GitHash hash={commit.id} />
        </CommitAttr>
        <CommitAttr name="parents">
          {commit.parentIds.map(pid => (
            <GitHash key={pid} hash={pid} style="display:block" />
          ))}
        </CommitAttr>
        <CommitAttr name="author">{commit.author}</CommitAttr>
        <CommitAttr name="date">{formatDateL(commit.date)}</CommitAttr>
      </table>
    </div>
  )
);

export default vca.component({
  name: "RevisionLogCommitDetail",
  props: {
    commit: required<CommitDetail>(),
    orientation: required<Orientation>(String)
  },
  setup(p) {
    const storage = injectStorage();
    const persist = useStorage(
      { columnWidths: {} as Record<string, number>, splitterPosition: 0.4 },
      storage,
      "CommitDetail"
    );
    const classes = computed(() => ({
      [style.container(p.orientation)]: true,
      [md.SUBHEADING]: true,
      [style.inactive]: !p.commit.id
    }));
    const showExternalDiff = (item: FileEntry) => {
      executeFileCommand(fileCommandDiffWithParent, p.commit, item, item.path);
    };
    const showContextMenu = (item: FileEntry, event: Event) => {
      event.preventDefault();
      showFileContextMenu(p.commit, item, item.path);
    };

    return () => {
      return (
        <div class={classes.value}>
          <CommitMetadata commit={p.commit} />
          <FileTable
            files={p.commit.files}
            widths={__sync(persist.columnWidths)}
            onRowdblclick={arg => showExternalDiff(arg.item)}
            onRowcontextmenu={arg => showContextMenu(arg.item, arg.event)}
          />
        </div>
      );
    };
  }
});
