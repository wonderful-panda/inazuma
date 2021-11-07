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
import { useCallback, useMemo } from "react";
import { CommandGroup, Cmd } from "../CommandGroup";
import InteractiveShell from "../InteractiveShell";
import lazyWithPreload from "../lazyWithPreload";
import { ActionItem, MainWindow } from "../MainWindow";
import SplitterPanel from "../PersistSplitterPanel";
import TabContainer, { TabContainerProps } from "../TabContainer";
import CommitLog from "./CommitLog";

const BlameTab = lazyWithPreload(() => import("./BlameTab"));
const LsTreeTab = lazyWithPreload(() => import("./LsTreeTab"));

const RepositoryPage: React.VFC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const refs = useSelector((state) => state.repository.log?.refs);
  const tab = useSelector((state) => state.repository.tab);
  const showInteractiveShell = useSelector((state) => state.misc.showInteractiveShell);
  const monospace = useSelector((state) => state.persist.config.fontFamily.monospace);
  const fontSize = useSelector((state) => state.persist.config.fontSize);
  const interactiveShell = useSelector((state) => state.persist.config.interactiveShell);
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>(
    (tab, active) => {
      if (!repoPath || !tab) {
        return <></>;
      }
      switch (tab.type) {
        case "commits":
          return <CommitLog active={active} />;
        case "file":
          return <BlameTab repoPath={repoPath} {...tab.payload} refs={refs} fontSize={fontSize} />;
        case "tree":
          return (
            <LsTreeTab repoPath={repoPath} sha={tab.payload.sha} refs={refs} fontSize={fontSize} />
          );
        default:
          assertNever(tab);
          break;
      }
    },
    [repoPath, refs, fontSize]
  );
  const callbacks = useMemo(
    () => ({
      selectTab: (index: number) => dispatch(SELECT_TAB(index)),
      closeTab: (index?: number) => dispatch(REMOVE_TAB(index)),
      selectNextTab: () => dispatch(SELECT_NEXT_TAB()),
      selectPrevTab: () => dispatch(SELECT_PREVIOUS_TAB()),
      closeRepository: () => dispatch(CLOSE_REPOSITORY()),
      toggleInteractiveShell: () => dispatch(TOGGLE_INTERACTIVE_SHELL()),
      hideInteractiveShell: () => dispatch(HIDE_INTERACTIVE_SHELL())
    }),
    [dispatch]
  );
  const drawerItems: ActionItem[] = useMemo(
    () => [
      {
        key: "backToHome",
        text: "Home",
        icon: "mdi:home",
        onClick: callbacks.closeRepository
      }
    ],
    [callbacks]
  );
  const interactiveShellConfigured = !!interactiveShell;
  const titleBarActions: ActionItem[] = useMemo(
    () => [
      {
        key: "toggleConsole",
        text: "Show / hide interactive shell",
        icon: "mdi:console",
        disabled: !interactiveShellConfigured,
        onClick: callbacks.toggleInteractiveShell
      }
    ],
    [interactiveShellConfigured, callbacks]
  );
  if (!repoPath || !tab) {
    return <></>;
  }
  return (
    <MainWindow title={repoPath} drawerItems={drawerItems} titleBarActions={titleBarActions}>
      <CommandGroup name="RepositoryPage">
        <Cmd name="NextTab" hotkey="Ctrl+Tab" handler={callbacks.selectNextTab} />
        <Cmd name="PrevTab" hotkey="Ctrl+Shift+Tab" handler={callbacks.selectPrevTab} />
        <Cmd name="CloseTab" hotkey="Ctrl+F4" handler={callbacks.closeTab} />
        <Cmd name="ToggleShell" hotkey="Ctrl+T" handler={callbacks.toggleInteractiveShell} />
        <Cmd name="CloseRepository" hotkey="Ctrl+H" handler={callbacks.closeRepository} />
      </CommandGroup>
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
            selectTab={callbacks.selectTab}
            closeTab={callbacks.closeTab}
          />
        }
        second={
          <InteractiveShell
            open={showInteractiveShell && !!interactiveShell}
            cmd={interactiveShell!}
            cwd={repoPath}
            hide={callbacks.hideInteractiveShell}
            fontFamily={monospace}
          />
        }
      />
    </MainWindow>
  );
};

export default RepositoryPage;
