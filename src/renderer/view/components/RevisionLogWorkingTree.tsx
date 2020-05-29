import * as vca from "vue-tsx-support/lib/vca";
import VSplitterPanel from "./base/VSplitterPanel";
import FileList from "./FileList";
import { __sync } from "view/utils/modifiers";
import { css } from "emotion";
import { executeFileCommand } from "../commands";
import {
  fileCommandDiffStaged as diffStaged,
  fileCommandDiffUnstaged as diffUnstaged
} from "../commands/fileCommandDiff";
import { computed } from "@vue/composition-api";
import { injectStorage, useStorage } from "./injection/storage";
import { required } from "./base/prop";
import { Orientation, SplitterDirection } from "view/mainTypes";
import { FileAction } from "./CommitFileRow";

const rootStyle = css`
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 8px;
`;

const stagedActions: readonly FileAction[] = [
  { icon: "remove", tooltip: "Unstage file", action: () => {} },
  {
    icon: "compare_arrows",
    tooltip: "Compare with committed",
    action: () => {}
  },
  { icon: "more_horiz", tooltip: "Other actions", action: () => {} }
];

const unstagedActions: readonly FileAction[] = [
  { icon: "add", tooltip: "Stage file", action: () => {} },
  {
    icon: "compare_arrows",
    tooltip: "Compare with staged",
    action: () => {}
  },
  { icon: "more_horiz", tooltip: "Other actions", action: () => {} }
];

export default vca.component({
  name: "RevisionLogWorkingTree",
  props: {
    commit: required<CommitDetail>(),
    refs: required<readonly Ref[]>(Array),
    orientation: required<Orientation>(String)
  },
  setup(p) {
    const storage = injectStorage();
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
    const splitterDirection = computed<SplitterDirection>(() =>
      p.orientation === "portrait" ? "vertical" : "horizontal"
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
        staticClass={rootStyle}
        direction={splitterDirection.value}
        splitterWidth={5}
        minSizeFirst="20%"
        minSizeSecond="20%"
        ratio={__sync(persist.splitterRatio)}
      >
        <FileList
          slot="first"
          title="Changes to be committed"
          files={stagedFiles.value}
          actions={stagedActions}
          onRowdblclick={showExternalDiffCommittedAndStaged}
        />
        <FileList
          slot="second"
          title="Changes not staged"
          files={unstagedFiles.value}
          actions={unstagedActions}
          onRowdblclick={showExternalDiffStagedAndUnstaged}
        />
      </VSplitterPanel>
    );
  }
});
