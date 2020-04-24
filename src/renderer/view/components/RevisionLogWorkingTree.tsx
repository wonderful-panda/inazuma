import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import VSplitterPanel from "./base/VSplitterPanel";
import FileTable from "./FileTable";
import * as md from "view/utils/md-classes";
import { __sync } from "view/utils/modifiers";
import * as emotion from "emotion";
import { executeFileCommand } from "../commands";
import {
  fileCommandDiffStaged as diffStaged,
  fileCommandDiffUnstaged as diffUnstaged
} from "../commands/fileCommandDiff";
import { injectNamespacedStorage, useStorage } from "./base/useStorage";
import { computed } from "@vue/composition-api";
const css = emotion.css;

export default vca.component({
  name: "RevisionLogWorkingTree",
  props: {
    commit: p.ofType<CommitDetail>().required
  },
  setup(p) {
    const storage = injectNamespacedStorage();
    const persist = useStorage(
      {
        splitterRatio: 0.5,
        columnWidths: {
          staged: {} as Record<string, number>,
          unstaged: {} as Record<string, number>
        }
      },
      storage,
      "RevisionLogWorkingTree"
    );
    const stagedFiles = computed(() => p.commit.files.filter(f => f.inIndex));
    const unstagedFiles = computed(() =>
      p.commit.files.filter(f => f.inWorkingTree)
    );
    const showExternalDiffCommittedAndStaged = ({
      item
    }: {
      item: FileEntry;
    }) => {
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      executeFileCommand(diffStaged, p.commit, item, item.path);
    };
    const showExternalDiffStagedAndUnstaged = ({
      item
    }: {
      item: FileEntry;
    }) => {
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      executeFileCommand(diffUnstaged, p.commit, item, item.path);
    };

    return () => (
      <VSplitterPanel
        staticClass={style.container}
        direction="vertical"
        splitterWidth={5}
        minSizeFirst="20%"
        minSizeSecond="20%"
        ratio={__sync(persist.splitterRatio)}
      >
        <div slot="first" staticClass={style.splitterPane}>
          <div staticClass={md.TITLE}>Changes to be committed</div>
          <FileTable
            files={stagedFiles.value}
            widths={__sync(persist.columnWidths.staged)}
            onRowdblclick={showExternalDiffCommittedAndStaged}
          />
        </div>
        <div slot="second" staticClass={style.splitterPane}>
          <div staticClass={md.TITLE}>Changes not staged</div>
          <FileTable
            files={unstagedFiles.value}
            widths={__sync(persist.columnWidths.unstaged)}
            onRowdblclick={showExternalDiffStagedAndUnstaged}
          />
        </div>
      </VSplitterPanel>
    );
  }
});

const style = {
  container: css`
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    padding: 8px;
  `,
  splitterPane: css`
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    padding: 0;
  `
};
