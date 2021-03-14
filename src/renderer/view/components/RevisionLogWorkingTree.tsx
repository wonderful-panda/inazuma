import * as vca from "vue-tsx-support/lib/vca";
import VSplitterPanel from "./base/VSplitterPanel";
import FileList from "./FileList";
import { __sync } from "view/utils/modifiers";
import { css } from "@emotion/css";
import { executeFileCommand } from "../commands";
import {
  fileCommandDiffStaged as diffStaged,
  fileCommandDiffUnstaged as diffUnstaged
} from "../commands/fileCommandDiff";
import { computed } from "@vue/composition-api";
import { injectStorage, useStorage } from "./injection/storage";
import { required } from "./base/prop";
import { Orientation, SplitterDirection } from "view/mainTypes";

const rootStyle = css`
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 8px;
`;

export default vca.component({
  name: "RevisionLogWorkingTree",
  props: {
    status: required<WorkingTreeStat>(),
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
    const splitterDirection = computed<SplitterDirection>(() =>
      p.orientation === "portrait" ? "vertical" : "horizontal"
    );
    const node = computed<DagNode>(() => ({ id: p.status.id, parentIds: p.status.parentIds }));
    const showExternalDiffCommittedAndStaged = ({ item }: { item: FileEntry }) => {
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      executeFileCommand(diffStaged, node.value, item, item.path);
    };
    const showExternalDiffStagedAndUnstaged = ({ item }: { item: FileEntry }) => {
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      executeFileCommand(diffUnstaged, node.value, item, item.path);
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
          commit={node.value}
          files={p.status.stagedFiles}
          onRowdblclick={showExternalDiffCommittedAndStaged}
        />
        <FileList
          slot="second"
          title="Changes not staged"
          commit={node.value}
          files={p.status.unstagedFiles}
          onRowdblclick={showExternalDiffStagedAndUnstaged}
        />
      </VSplitterPanel>
    );
  }
});
