import { useCommandGroup } from "@/hooks/useCommandGroup";
import { useDispatch, useSelector } from "@/store";
import {
  REMOVE_TAB,
  SELECT_NEXT_TAB,
  SELECT_PREVIOUS_TAB,
  SELECT_TAB,
  TabType
} from "@/store/repository";
import { assertNever } from "@/util";
import { useCallback, useEffect } from "react";
import { MainWindow } from "../MainWindow";
import TabContainer, { TabContainerProps } from "../TabContainer";
import BlameTab from "./BlameTab";
import CommitLog from "./CommitLog";

const RepositoryPage: React.VFC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const refs = useSelector((state) => state.repository.log?.refs);
  const tab = useSelector((state) => state.repository.tab);
  if (!repoPath || !tab) {
    return <></>;
  }
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>(
    (tab, active) => {
      switch (tab.type) {
        case "commits":
          return <CommitLog active={active} />;
        case "file":
          return <BlameTab repoPath={repoPath} {...tab.payload} refs={refs} />;
        case "tree":
          return <div>TEST</div>;
        default:
          assertNever(tab);
          break;
      }
    },
    []
  );

  const commandGroup = useCommandGroup();
  const selectTab = useCallback((index: number) => dispatch(SELECT_TAB(index)), []);
  const closeTab = useCallback((index?: number) => dispatch(REMOVE_TAB(index)), []);
  useEffect(() => {
    const groupName = "RepositoryPage";
    commandGroup.register({
      groupName,
      commands: [
        {
          name: "NextTab",
          hotkey: "Ctrl+Tab",
          handler: () => dispatch(SELECT_NEXT_TAB())
        },
        {
          name: "PrevTab",
          hotkey: "Ctrl+Shift+Tab",
          handler: () => dispatch(SELECT_PREVIOUS_TAB())
        },
        {
          name: "CloseTab",
          hotkey: "Ctrl+F4",
          handler: closeTab
        }
      ]
    });
    return () => {
      commandGroup.unregister(groupName);
    };
  }, []);
  return (
    <MainWindow title={repoPath}>
      <TabContainer
        tabs={tab.tabs}
        currentTabIndex={tab.currentIndex}
        renderTabContent={renderTabContent}
        selectTab={selectTab}
        closeTab={closeTab}
      />
    </MainWindow>
  );
};

export default RepositoryPage;
