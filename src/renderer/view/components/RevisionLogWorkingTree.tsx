import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
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
import { withPersist } from "./base/withPersist";
const css = emotion.css;

const RevisionLogWorkingTree = tsx.component(
  // @vue/component
  {
    name: "RevisionLogWorkingTree",
    props: {
      commit: p.ofType<CommitDetail>().required
    },
    data() {
      return {
        splitterRatio: 0.5,
        columnWidths: {
          staged: {} as Record<string, number>,
          unstaged: {} as Record<string, number>
        }
      };
    },
    computed: {
      stagedFiles(): FileEntry[] {
        return this.commit.files.filter(f => {
          return f.inIndex;
        });
      },
      unstagedFiles(): FileEntry[] {
        return this.commit.files.filter(f => {
          return f.inWorkingTree;
        });
      }
    },
    methods: {
      showExternalDiffCommittedAndStaged({ item }: { item: FileEntry }) {
        if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
          return;
        }
        executeFileCommand(diffStaged, this.commit, item, item.path);
      },
      showExternalDiffStagedAndUnstaged({ item }: { item: FileEntry }) {
        if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
          return;
        }
        executeFileCommand(diffUnstaged, this.commit, item, item.path);
      }
    },
    render(): VNode {
      return (
        <VSplitterPanel
          staticClass={style.container}
          direction="vertical"
          splitterWidth={5}
          minSizeFirst="20%"
          minSizeSecond="20%"
          ratio={__sync(this.splitterRatio)}
        >
          <div slot="first" staticClass={style.splitterPane}>
            <div staticClass={md.TITLE}>Changes to be committed</div>
            <FileTable
              files={this.stagedFiles}
              widths={__sync(this.columnWidths.staged)}
              onRowdblclick={this.showExternalDiffCommittedAndStaged}
            />
          </div>
          <div slot="second" staticClass={style.splitterPane}>
            <div staticClass={md.TITLE}>Changes not staged</div>
            <FileTable
              files={this.unstagedFiles}
              widths={__sync(this.columnWidths.unstaged)}
              onRowdblclick={this.showExternalDiffStagedAndUnstaged}
            />
          </div>
        </VSplitterPanel>
      );
    }
  }
);

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

export default withPersist(
  RevisionLogWorkingTree,
  ["splitterRatio", "columnWidths"],
  "RevisionLogWorkingTree"
);
