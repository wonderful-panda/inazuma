import * as vca from "vue-tsx-support/lib/vca";
import { shortHash } from "../filters";
import { getLangIdFromPath } from "view/monaco";
import FileLogTable from "./FileLogTable";
import VSplitterPanel from "./base/VSplitterPanel";
import BlamePanelFooter from "./BlamePanelFooter";
import BlamePanelMonaco from "./BlamePanelMonaco";
import { __sync } from "../utils/modifiers";
import { css } from "@emotion/css";
import { getFileContextMenuItems } from "../commands";
import { SplitterDirection } from "view/mainTypes";
import { ref, computed } from "@vue/composition-api";
import { injectStorage, useStorage } from "./injection/storage";
import { required } from "./base/prop";
import { injectContextMenu } from "./injection/contextMenu";
import { RowEventArgs } from "vue-vtable";

const style = {
  container: css`
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    overflow: hidden;
  `,
  title: css`
    font-family: var(--monospace-fontfamily);
    padding-bottom: 4px;
    height: 24px;
    line-height: 24px;
    flex: 0;
  `,
  path: css`
    padding-right: 8px;
  `,
  sha: css`
    color: #888;
  `
};

const BlamePanel = vca.component({
  name: "BlamePanel",
  props: {
    path: required(String),
    sha: required(String),
    blame: required<Blame>()
  },
  setup(props) {
    const selectedCommitId = ref("");
    const cmenu = injectContextMenu();
    const storage = injectStorage();
    const persist = useStorage(
      {
        columnWidths: {} as Record<string, number>,
        splitter: { ratio: 0.3, direction: "vertical" as SplitterDirection }
      },
      storage,
      "BlamePanel"
    );
    const language = computed(() => getLangIdFromPath(props.path));
    const commits = computed(() => new Map(props.blame.commits.map((c) => [c.id, c])));
    const hoveredCommit = ref(undefined as FileCommit | undefined);
    const selectedCommitIndex = computed(() => {
      const id = selectedCommitId.value;
      if (!id) {
        return -1;
      } else {
        return props.blame.commits.findIndex((c) => c.id === id);
      }
    });
    const onHoveredCommitIdChanged = (e: { commitId: string }) => {
      if (!e.commitId) {
        hoveredCommit.value = undefined;
      }
      hoveredCommit.value = commits.value.get(e.commitId);
    };
    const showContextMenu = (item: FileCommit, event: MouseEvent) => {
      const items = getFileContextMenuItems(item, item, props.path, true);
      cmenu.show(event, items);
    };
    const showContextMenuFromList = (arg: RowEventArgs<FileCommit, MouseEvent>) => {
      showContextMenu(arg.item, arg.event);
    };
    const showContextMenuFromMonaco = (arg: { commitId: string, event: MouseEvent }) => {
      if (!arg.commitId) {
        return;
      }
      const commit = commits.value.get(arg.commitId);
      if (!commit) {
        return;
      }
      showContextMenu(commit, arg.event);
    };

    return () => {
      return (
        <div class={style.container}>
          <div class={style.title}>
            <span class={style.path}>{props.path}</span>
            <span class={style.sha}>@ {shortHash(props.sha)}</span>
          </div>
          <VSplitterPanel
            class={style.container}
            splitterWidth={5}
            minSizeFirst="10%"
            minSizeSecond="10%"
            allowDirectionChange
            direction={__sync(persist.splitter.direction)}
            ratio={__sync(persist.splitter.ratio)}
          >
            <FileLogTable
              slot="first"
              style={{ flex: 1, border: "1px solid #444" }}
              items={props.blame.commits}
              rowHeight={24}
              selectedIndex={selectedCommitIndex.value}
              widths={__sync(persist.columnWidths)}
              onRowclick={(args) => {
                selectedCommitId.value = args.item.id;
              }}
              onRowcontextmenu={showContextMenuFromList}
            />
            <BlamePanelMonaco
              slot="second"
              language={language.value}
              blame={props.blame}
              selectedCommitId={__sync(selectedCommitId.value)}
              onContextMenu={showContextMenuFromMonaco}
              onHoveredCommitIdChanged={onHoveredCommitIdChanged}
            />
          </VSplitterPanel>
          <BlamePanelFooter commit={hoveredCommit.value} />
        </div>
      );
    };
  }
});

export default BlamePanel;
