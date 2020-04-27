import * as md from "view/utils/md-classes";
import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import FileTable from "./FileTable";
import { __sync } from "view/utils/modifiers";
import * as emotion from "emotion";
import { showFileContextMenu, executeFileCommand } from "../commands";
import { fileCommandDiffWithParent } from "../commands/fileCommandDiff";
import { computed } from "@vue/composition-api";
import { GitHash } from "./GitHash";
import { formatDateL } from "core/utils";
import { injectStorage, useStorage } from "./injection/storage";
const css = emotion.css;

const style = {
  container: css`
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    padding: 8px;
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
    margin: 0px 2px 8px 2px;
    font-size: small;
    background-color: #333;
    padding: 0.2em;
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

export default vca.component({
  name: "RevisionLogCommitDetail",
  props: {
    commit: p.ofType<CommitDetail>().required
  },
  setup(p) {
    const storage = injectStorage();
    const persist = useStorage(
      { columnWidths: {} as Record<string, number> },
      storage,
      "CommitDetail"
    );
    const classes = computed(() => ({
      [style.container]: true,
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

    return () => (
      <div class={classes.value}>
        <div class={[style.summary, md.TITLE]}>
          {p.commit.summary || "No commit selected"}
        </div>
        <table staticClass={style.attrTable}>
          <CommitAttr name="id">
            <GitHash hash={p.commit.id} />
          </CommitAttr>
          <CommitAttr name="parents">
            {p.commit.parentIds.map(pid => (
              <GitHash key={pid} hash={pid} style="display:block" />
            ))}
          </CommitAttr>
          <CommitAttr name="author">{p.commit.author}</CommitAttr>
          <CommitAttr name="date">{formatDateL(p.commit.date)}</CommitAttr>
        </table>
        <pre v-show={p.commit.body} staticClass={style.body}>
          {p.commit.body}
        </pre>
        <FileTable
          files={p.commit.files}
          widths={__sync(persist.columnWidths)}
          onRowdblclick={arg => showExternalDiff(arg.item)}
          onRowcontextmenu={arg => showContextMenu(arg.item, arg.event)}
        />
      </div>
    );
  }
});
