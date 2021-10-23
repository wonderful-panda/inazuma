import { useCommandGroup } from "@/hooks/useCommandGroup";
import { useDispatch, useSelector } from "@/store";
import { HIDE_INTERACTIVE_SHELL, TOGGLE_INTERACTIVE_SHELL } from "@/store/misc";
import {
  CLOSE_REPOSITORY,
  REMOVE_TAB,
  SELECT_NEXT_TAB,
  SELECT_PREVIOUS_TAB,
  SELECT_TAB,
  TabType
} from "@/store/repository";
import { assertNever } from "@/util";
import { useCallback, useEffect, useMemo } from "react";
import InteractiveShell from "../InteractiveShell";
import { ActionItem, MainWindow } from "../MainWindow";
import SplitterPanel from "../PersistSplitterPanel";
import TabContainer, { TabContainerProps } from "../TabContainer";
import BlameTab from "./BlameTab";
import CommitLog from "./CommitLog";

const RepositoryPage: React.VFC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const refs = useSelector((state) => state.repository.log?.refs);
  const tab = useSelector((state) => state.repository.tab);
  const showInteractiveShell = useSelector((state) => state.misc.showInteractiveShell);
  const monospace = useSelector((state) => state.persist.config.fontFamily.monospace);
  const interactiveShell = useSelector((state) => state.persist.config.interactiveShell);
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
        },
        {
          name: "ToggleInteractiveShell",
          hotkey: "Ctrl+T",
          handler: () => dispatch(TOGGLE_INTERACTIVE_SHELL())
        }
      ]
    });
    return () => {
      commandGroup.unregister(groupName);
    };
  }, []);
  const hideInteractiveShell = useCallback(() => dispatch(HIDE_INTERACTIVE_SHELL()), []);
  const drawerItems: ActionItem[] = useMemo(
    () => [
      {
        key: "backToHome",
        text: "Home",
        icon: "mdi:home",
        onClick: () => dispatch(CLOSE_REPOSITORY())
      }
    ],
    []
  );
  const titleBarActions: ActionItem[] = useMemo(
    () => [
      {
        key: "toggleInterativeShell",
        text: "Show / hide interactive shell",
        icon: "mdi:console",
        disabled: !interactiveShell,
        onClick: () => dispatch(TOGGLE_INTERACTIVE_SHELL())
      }
    ],
    [!interactiveShell]
  );
  return (
    <MainWindow title={repoPath} drawerItems={drawerItems} titleBarActions={titleBarActions}>
      <SplitterPanel
        persistKey="repository"
        initialDirection="horiz"
        initialRatio={0.7}
        showSecondPanel={showInteractiveShell && !!interactiveShell}
        allowDirectionChange
        firstPanelMinSize="20%"
        secondPanelMinSize="20%"
        first={
          <TabContainer
            tabs={tab.tabs}
            currentTabIndex={tab.currentIndex}
            renderTabContent={renderTabContent}
            selectTab={selectTab}
            closeTab={closeTab}
          />
        }
        second={
          <InteractiveShell
            open={showInteractiveShell && !!interactiveShell}
            cmd={interactiveShell!}
            hide={hideInteractiveShell}
            fontFamily={monospace}
          />
        }
      />
    </MainWindow>
  );
};

export default RepositoryPage;
