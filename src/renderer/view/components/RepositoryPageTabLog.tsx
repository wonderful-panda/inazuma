import { VNode } from "vue";
import { RowEventArgs } from "vue-vtable";
import { storeComponent } from "../store";
import * as ds from "view/store/displayState";
import RevisionLogWorkingTree from "./RevisionLogWorkingTree";
import RevisionLogCommitDetail from "./RevisionLogCommitDetail";
import LogTable from "./LogTable";
import VSplitterPanel from "./base/VSplitterPanel";
import { dragdrop } from "../dragdrop";
import { LogItem } from "../mainTypes";
import { __sync } from "view/utils/modifiers";
import { showContextMenu } from "core/browser";

// @vue/component
export default storeComponent.create({
  name: "RepositoryPageTabLog",
  mixins: [ds.createMixin("TheRevisionLogPage")],
  data() {
    return {
      displayState: {
        splitterPosition: 0.6,
        columnWidths: {} as Dict<number>
      }
    };
  },
  methods: {
    onRowdragover({ item, event }: RowEventArgs<LogItem, DragEvent>) {
      if (item.commit.id === "--") {
        return;
      }
      if (dragdrop.isDataPresent(event, "git/branch")) {
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
    reload() {
      location.reload();
    },
    runInteractiveShell() {
      this.actions.runInteractiveShell();
    },
    showContextMenu({ item, event }: RowEventArgs<LogItem, Event>) {
      event.preventDefault();
      showContextMenu([
        {
          label: "Show tree",
          click: () => {
            this.actions.showTreeTab(item.commit.id);
          }
        }
      ]);
    }
  },
  render(): VNode {
    const { state, getters, actions } = this;
    return (
      <VSplitterPanel
        style={{ flex: 1, margin: "2px" }}
        direction="horizontal"
        splitterWidth={5}
        ratio={__sync(this.displayState.splitterPosition)}
      >
        <LogTable
          slot="first"
          items={getters.items}
          rowHeight={state.rowHeight}
          selectedIndex={state.selectedIndex}
          widths={__sync(this.displayState.columnWidths)}
          onRowclick={e => actions.setSelectedIndex(e.index)}
          onRowdragover={this.onRowdragover}
          onRowdrop={this.onRowdrop}
          onRowcontextmenu={this.showContextMenu}
        />
        <template slot="second">
          {state.selectedCommit.id === "--" ? (
            <RevisionLogWorkingTree />
          ) : (
            <RevisionLogCommitDetail />
          )}
        </template>
      </VSplitterPanel>
    );
  }
});
