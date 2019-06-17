import { VNode } from "vue";
import { RowEventArgs } from "vue-vtable";
import { withStore, rootModule } from "../store";
import RevisionLogWorkingTree from "./RevisionLogWorkingTree";
import RevisionLogCommitDetail from "./RevisionLogCommitDetail";
import LogTable from "./LogTable";
import VSplitterPanel from "./base/VSplitterPanel";
import { dragdrop } from "../dragdrop";
import { LogItem, SplitterDirection } from "../mainTypes";
import { __sync } from "view/utils/modifiers";
import { showCommitContextMenu } from "../commands";
import { withPersist } from "./base/withPersist";

const RepositoryPageTabLog = withStore.create(
  // @vue/component
  {
    name: "RepositoryPageTabLog",
    data() {
      return {
        splitter: { ratio: 0.6, direction: "horizontal" as SplitterDirection },
        columnWidths: {} as Record<string, number>
      };
    },
    computed: rootModule.mapGetters(["items"]),
    methods: {
      ...rootModule.mapActions(["runInteractiveShell", "setSelectedIndex"]),
      onRowdragover({ item, event }: RowEventArgs<LogItem, DragEvent>) {
        if (item.commit.id === "--") {
          return;
        }
        if (dragdrop.isDataPresent(event, "git/branch") && event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
          event.preventDefault();
        }
      },
      onRowdrop({ item, event }: RowEventArgs<LogItem, DragEvent>) {
        if (item.commit.id === "--") {
          return;
        }
        const data = dragdrop.getData(event, "git/branch");
        console.log(data);
      },
      showContextMenu({ item, event }: RowEventArgs<LogItem, Event>) {
        event.preventDefault();
        showCommitContextMenu(item.commit);
      }
    },
    render(): VNode {
      const state = this.state;
      return (
        <VSplitterPanel
          style={{ flex: 1, margin: "2px" }}
          allowDirectionChange
          direction={__sync(this.splitter.direction)}
          splitterWidth={5}
          ratio={__sync(this.splitter.ratio)}
        >
          <LogTable
            slot="first"
            items={this.items}
            rowHeight={state.rowHeight}
            selectedIndex={state.selectedIndex}
            widths={__sync(this.columnWidths)}
            onRowclick={e => this.setSelectedIndex({ index: e.index })}
            onRowdragover={this.onRowdragover}
            onRowdrop={this.onRowdrop}
            onRowcontextmenu={this.showContextMenu}
          />
          <template slot="second">
            {state.selectedCommit.id === "--" ? (
              <RevisionLogWorkingTree commit={state.selectedCommit} />
            ) : (
              <RevisionLogCommitDetail commit={state.selectedCommit} />
            )}
          </template>
        </VSplitterPanel>
      );
    }
  }
);

export default withPersist(
  RepositoryPageTabLog,
  ["columnWidths", "splitter"],
  "RepositoryPageTabLog"
);
