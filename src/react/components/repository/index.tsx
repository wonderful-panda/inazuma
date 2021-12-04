import { IconActionItem } from "@/commands/types";
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
import { RELOAD_REPOSITORY } from "@/store/thunk/reloadRepository";
import { assertNever } from "@/util";
import { useCallback, useMemo } from "react";
import { CommandGroup, Cmd } from "../CommandGroup";
import { InteractiveShell } from "../InteractiveShell";
import { MainWindow } from "../MainWindow";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { TabContainer, TabContainerProps, TooltipTitle } from "../TabContainer";
import CommitLog from "./CommitLog";
import BlameTabTooltip from "./BlameTabTooltip";
import LsTreeTabTooltip from "./LsTreeTabTooltip";
import CommitDiffTabTooltip from "./CommitDiffTabTooltip";
import { lazy } from "../hoc/lazy";

const BlameTab = lazy(() => import("./BlameTab"), { preload: true });
const LsTreeTab = lazy(() => import("./LsTreeTab"), { preload: true });
const CommitDiffTab = lazy(() => import("./CommitDiffTab"), { preload: true });

const renderTabTooltip: TabContainerProps<TabType>["renderTabTooltip"] = (tab) => {
  switch (tab.type) {
    case "commits":
      return <TooltipTitle text="Commit log" />;
    case "file":
      return <BlameTabTooltip {...tab.payload} />;
    case "tree":
      return <LsTreeTabTooltip {...tab.payload} />;
    case "commitDiff":
      return <CommitDiffTabTooltip {...tab.payload} />;
    default:
      return assertNever(tab);
  }
};

const RepositoryPage: React.VFC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const refs = useSelector((state) => state.repository.log?.refs);
  const tab = useSelector((state) => state.repository.tab);
  const showInteractiveShell = useSelector((state) => state.misc.showInteractiveShell);
  const monospace = useSelector((state) => state.persist.config.fontFamily.monospace);
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
          return <BlameTab repoPath={repoPath} {...tab.payload} refs={refs} />;
        case "tree":
          return <LsTreeTab repoPath={repoPath} {...tab.payload} refs={refs} />;
        case "commitDiff":
          return <CommitDiffTab repoPath={repoPath} {...tab.payload} />;
        default:
          assertNever(tab);
          break;
      }
    },
    [repoPath, refs]
  );
  const callbacks = useMemo(
    () => ({
      selectTab: (index: number) => dispatch(SELECT_TAB(index)),
      closeTab: (index?: number) => dispatch(REMOVE_TAB(index)),
      selectNextTab: () => dispatch(SELECT_NEXT_TAB()),
      selectPrevTab: () => dispatch(SELECT_PREVIOUS_TAB()),
      closeRepository: () => dispatch(CLOSE_REPOSITORY()),
      toggleInteractiveShell: () => dispatch(TOGGLE_INTERACTIVE_SHELL()),
      hideInteractiveShell: () => dispatch(HIDE_INTERACTIVE_SHELL()),
      reloadRepository: () => dispatch(RELOAD_REPOSITORY())
    }),
    [dispatch]
  );
  const drawerItems: IconActionItem[] = useMemo(
    () => [
      {
        id: "backToHome",
        label: "Home",
        icon: "mdi:home",
        handler: callbacks.closeRepository
      }
    ],
    [callbacks]
  );
  const interactiveShellConfigured = !!interactiveShell;
  const titleBarActions: IconActionItem[] = useMemo(
    () => [
      {
        id: "toggleConsole",
        label: "Show / hide interactive shell",
        icon: "mdi:console",
        disabled: !interactiveShellConfigured,
        handler: callbacks.toggleInteractiveShell
      },
      {
        id: "reload",
        label: "Reload repository",
        icon: "mdi:reload",
        handler: callbacks.reloadRepository
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
        <Cmd name="ReloadRepository" hotkey="Ctrl+R" handler={callbacks.reloadRepository} />
      </CommandGroup>
      <PersistSplitterPanel
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
            renderTabTooltip={renderTabTooltip}
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
