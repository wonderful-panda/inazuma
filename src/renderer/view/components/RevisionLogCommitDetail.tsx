import * as md from "view/utils/md-classes";
import * as vca from "vue-tsx-support/lib/vca";
import FileList from "./FileList";
import { __sync } from "view/utils/modifiers";
import { css } from "@emotion/css";
import {
  showFileContextMenu,
  executeFileCommand,
  executeCommitCommand
} from "../commands";
import {
  fileCommandDiffWithParent,
  fileCommandDiffWithLocal
} from "../commands/fileCommandDiff";
import { GitHash } from "./GitHash";
import { formatDateLLL } from "core/utils";
import { injectStorage, useStorage } from "./injection/storage";
import { required } from "./base/prop";
import { Orientation } from "view/mainTypes";
import VButton from "./base/VButton";
import { withclass } from "./base/withClass";
import RefBadge from "./RefBadge";
import { commitCommandYankHash } from "view/commands/commitCommandYankHash";
import { commitCommandBrowseTree } from "view/commands/commitCommandBrowseTree";
import VSplitterPanel from "./base/VSplitterPanel";
import {
  fileCommandBlame,
  fileCommandBlameParent
} from "view/commands/fileCommandBlame";
import { fileCommandYankPath } from "view/commands/fileCommandYankPath";

const style = {
  container: css`
    display: flex;
    flex: 1;
    padding: 12px;
  `,
  metadata: css`
    display: flex;
    flex: 1;
    margin: 2px !important;
    flex-flow: column nowrap;
    background-color: #282828 !important;
  `,
  cardContent: css`
    flex: 1;
    margin: 0 16px;
    padding: 0 8px 8px 8px !important;
    overflow: auto;
  `,
  refs: css`
    margin: 4px 8px;
  `,
  body: (orientation: Orientation) => css`
    font-family: var(--default-fontfamily);
    min-height: 1em;
    max-height: ${orientation === "portrait" && "8em"};
    margin: 0;
    white-space: pre-wrap;
    overflow: auto;
  `,
  commitAttrIcon: css`
    font-size: 20px !important;
    margin-left: 8px;
  `,
  commitAttr: css`
    vertical-align: middle;
  `
};

const AttrIcon = withclass("md-icon")(style.commitAttrIcon);
const AttrText = withclass.span(style.commitAttr);

const CommitMetadata = vca.component({
  name: "CommitMetadata",
  props: {
    commit: required<CommitDetail>(Object),
    refs: required<readonly Ref[]>(Array),
    orientation: required<Orientation>(String)
  },
  setup(p) {
    const yankHash = () => {
      executeCommitCommand(commitCommandYankHash, p.commit);
    };
    const browseTree = () => {
      executeCommitCommand(commitCommandBrowseTree, p.commit);
    };
    return () => {
      const { commit, refs, orientation } = p;
      return (
        <md-card class={style.metadata}>
          <md-card-header v-show={commit.id}>
            <h2 class={md.TITLE}>{commit.summary}</h2>
            <div class="md-subhead" v-show={commit.id}>
              <GitHash class={style.commitAttr} hash={commit.id} />
              <AttrIcon>face</AttrIcon>
              <AttrText>{commit.author}</AttrText>
              <AttrIcon>schedule</AttrIcon>
              <AttrText>{formatDateLLL(commit.date)}</AttrText>
            </div>
            <div class={style.refs} v-show={refs}>
              {refs.map(r => (
                <RefBadge key={r.id} refObject={r} />
              ))}
            </div>
          </md-card-header>
          <md-card-content v-show={commit.id} class={style.cardContent}>
            <pre v-show={commit.body} class={style.body(orientation)}>
              {commit.body}
            </pre>
          </md-card-content>
          <md-card-actions v-show={commit.id}>
            <VButton action={yankHash}>Copy Hash</VButton>
            <VButton action={browseTree}>Browse Tree</VButton>
          </md-card-actions>
        </md-card>
      );
    };
  }
});

export default vca.component({
  name: "RevisionLogCommitDetail",
  props: {
    commit: required<CommitDetail>(),
    refs: required<readonly Ref[]>(Array),
    orientation: required<Orientation>(String)
  },
  setup(p) {
    const storage = injectStorage();
    const persist = useStorage(
      { columnWidths: {} as Record<string, number>, splitterPosition: 0.4 },
      storage,
      "CommitDetail"
    );
    const showExternalDiff = (item: FileEntry) => {
      executeFileCommand(fileCommandDiffWithParent, p.commit, item, item.path);
    };
    const showContextMenu = (item: FileEntry, event: Event) => {
      event.preventDefault();
      showFileContextMenu(p.commit, item, item.path);
    };
    return () => {
      return (
        <VSplitterPanel
          class={style.container}
          direction={p.orientation === "landscape" ? "horizontal" : "vertical"}
          ratio={__sync(persist.splitterPosition)}
          splitterWidth={5}
        >
          <CommitMetadata
            slot="first"
            commit={p.commit}
            refs={p.refs}
            orientation={p.orientation}
          />
          <FileList
            slot="second"
            commit={p.commit}
            title={p.commit.id && "Changes"}
            files={p.commit.files}
            buttons={[fileCommandBlame, fileCommandDiffWithParent]}
            menus={[
              fileCommandBlameParent,
              fileCommandDiffWithLocal,
              fileCommandYankPath
            ]}
            onRowdblclick={arg => showExternalDiff(arg.item)}
            onRowcontextmenu={arg => showContextMenu(arg.item, arg.event)}
          />
        </VSplitterPanel>
      );
    };
  }
});
