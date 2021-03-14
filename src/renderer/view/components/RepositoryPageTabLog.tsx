import * as vca from "vue-tsx-support/lib/vca";
import { RowEventArgs } from "vue-vtable";
import { useRootModule } from "../store";
// import RevisionLogWorkingTree from "./RevisionLogWorkingTree";
import RevisionLogCommitDetail from "./RevisionLogCommitDetail";
import LogTable from "./LogTable";
import VSplitterPanel from "./base/VSplitterPanel";
import { dragdrop } from "../dragdrop";
import { LogItem, SplitterDirection, Orientation } from "../mainTypes";
import { __sync } from "view/utils/modifiers";
import {
  injectStorage,
  provideStorageWithAdditionalNamespace,
  useStorage
} from "./injection/storage";
import { computed } from "@vue/composition-api";
import { css } from "@emotion/css";
import { injectContextMenu } from "./injection/contextMenu";
import { getCommitContextMenuItems } from "view/commands";
import RevisionLogWorkingTree from "./RevisionLogWorkingTree";

const rootStyle = css`
  flex: 1;
  margin: 2px;
`;

export default vca.component({
  name: "RepositoryPageTabLog",
  setup() {
    const rootCtx = useRootModule();
    const storage = injectStorage();
    const cmenu = injectContextMenu();
    provideStorageWithAdditionalNamespace("TabLog", storage);
    const persistData = useStorage(
      {
        splitter: { ratio: 0.6, direction: "horizontal" as SplitterDirection },
        columnWidths: {} as Record<string, number>
      },
      storage,
      "TabLog"
    );

    const onRowdragover = ({ item, event }: RowEventArgs<LogItem, DragEvent>) => {
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

    const showContextMenu = ({ item, event }: RowEventArgs<LogItem, MouseEvent>) => {
      event.preventDefault();
      const menuItems = getCommitContextMenuItems(item.commit);
      cmenu.show(event, menuItems);
    };

    return () => {
      const state = rootCtx.state;
      const detailOrientation = computed<Orientation>(() =>
        persistData.splitter.direction === "horizontal" ? "portrait" : "landscape"
      );
      const logDetail = rootCtx.state.selectedCommit;
      const detailPanel =
        logDetail.type === "status" ? (
          <RevisionLogWorkingTree
            slot="second"
            status={logDetail}
            orientation={detailOrientation.value}
          />
        ) : (
          <RevisionLogCommitDetail
            slot="second"
            commit={logDetail}
            refs={rootCtx.getters.selectedCommitRefs}
            orientation={detailOrientation.value}
          />
        );

      return (
        <VSplitterPanel
          class={rootStyle}
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
            onRowclick={(e) => rootCtx.actions.setSelectedIndex({ index: e.index })}
            onRowdragover={onRowdragover}
            onRowdrop={onRowdrop}
            onRowcontextmenu={showContextMenu}
          />
          {detailPanel}
        </VSplitterPanel>
      );
    };
  }
});
