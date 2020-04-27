import * as vca from "vue-tsx-support/lib/vca";
import { RowEventArgs } from "vue-vtable";
import { useRootModule } from "../store";
import RevisionLogWorkingTree from "./RevisionLogWorkingTree";
import RevisionLogCommitDetail from "./RevisionLogCommitDetail";
import LogTable from "./LogTable";
import VSplitterPanel from "./base/VSplitterPanel";
import { dragdrop } from "../dragdrop";
import { LogItem, SplitterDirection } from "../mainTypes";
import { __sync } from "view/utils/modifiers";
import { showCommitContextMenu } from "../commands";
import {
  injectStorage,
  provideStorageWithAdditionalNamespace,
  useStorage
} from "./injection/storage";

export default vca.component({
  setup() {
    const rootCtx = useRootModule();
    const storage = injectStorage();
    provideStorageWithAdditionalNamespace("TabLog", storage);
    const persistData = useStorage(
      {
        splitter: { ratio: 0.6, direction: "horizontal" as SplitterDirection },
        columnWidths: {} as Record<string, number>
      },
      storage,
      "TabLog"
    );

    const onRowdragover = ({
      item,
      event
    }: RowEventArgs<LogItem, DragEvent>) => {
      if (item.commit.id === "--") {
        return;
      }
      if (dragdrop.isDataPresent(event, "git/branch") && event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
      }
    };

    const onRowdrop = ({ item, event }: RowEventArgs<LogItem, DragEvent>) => {
      if (item.commit.id === "--") {
        return;
      }
      const data = dragdrop.getData(event, "git/branch");
      console.log(data);
    };

    const showContextMenu = ({ item, event }: RowEventArgs<LogItem, Event>) => {
      event.preventDefault();
      showCommitContextMenu(item.commit);
    };

    return () => {
      const state = rootCtx.state;
      return (
        <VSplitterPanel
          style={{ flex: 1, margin: "2px" }}
          allowDirectionChange
          direction={__sync(persistData.splitter.direction)}
          splitterWidth={5}
          ratio={__sync(persistData.splitter.ratio)}
        >
          <LogTable
            slot="first"
            items={rootCtx.getters.items}
            rowHeight={state.rowHeight}
            selectedIndex={state.selectedIndex}
            widths={__sync(persistData.columnWidths)}
            onRowclick={e =>
              rootCtx.actions.setSelectedIndex({ index: e.index })
            }
            onRowdragover={onRowdragover}
            onRowdrop={onRowdrop}
            onRowcontextmenu={showContextMenu}
          />
          <template slot="second">
            {rootCtx.state.selectedCommit.id === "--" ? (
              <RevisionLogWorkingTree commit={state.selectedCommit} />
            ) : (
              <RevisionLogCommitDetail commit={state.selectedCommit} />
            )}
          </template>
        </VSplitterPanel>
      );
    };
  }
});
