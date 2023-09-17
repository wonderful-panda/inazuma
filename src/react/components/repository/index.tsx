import { IconActionItem } from "@/commands/types";
import { DevTools } from "jotai-devtools";
import { assertNever } from "@/util";
import { useCallback, useMemo, useEffect } from "react";
import { CommandGroup, Cmd } from "../CommandGroup";
import { InteractiveShell } from "../InteractiveShell";
import { MainWindowProperty } from "../MainWindow";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { TabContainer, TabContainerProps, TooltipTitle } from "../TabContainer";
import CommitLog from "./CommitLog";
import BlameTabTooltip from "./BlameTabTooltip";
import LsTreeTabTooltip from "./LsTreeTabTooltip";
import CommitDiffTabTooltip from "./CommitDiffTabTooltip";
import { lazy } from "../hoc/lazy";
import { repositoryStoresAtomFamily, useConfigValue } from "@/state/root";
import { logAtom, repoPathAtom } from "@/state/repository";
import { Provider, useAtomValue, useSetAtom } from "jotai";
import {
  TabType,
  removeRepoTabAtom,
  selectNextRepoTabAtom,
  selectPreviousRepoTabAtom,
  selectRepoTabAtom,
  repoTabsAtom
} from "@/state/repository/tabs";
import {
  hideInteractiveShellAtom,
  interactiveShellAtom,
  toggleInteractiveShellAtom
} from "@/state/repository/misc";
import { useReloadRepository } from "@/hooks/actions/openRepository";
import { CommandGroupTreeProvider } from "@/context/CommandGroupContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";

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

const RepositoryPage: React.FC<{ active: boolean }> = ({ active }) => {
  const repoPath = useAtomValue(repoPathAtom);
  const tabs = useAtomValue(repoTabsAtom);
  const refs = useAtomValue(logAtom)?.refs;
  const interactiveShell = useAtomValue(interactiveShellAtom);
  const toggleInteractiveShell = useSetAtom(toggleInteractiveShellAtom);
  const hideInteractiveShell = useSetAtom(hideInteractiveShellAtom);
  const config = useConfigValue();
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>(
    (tab, active) => {
      if (!repoPath || !tab) {
        return <></>;
      }
      let child: React.ReactNode;
      switch (tab.type) {
        case "commits":
          child = <CommitLog />;
          break;
        case "file":
          child = <BlameTab repoPath={repoPath} {...tab.payload} refs={refs} />;
          break;
        case "tree":
          child = <LsTreeTab repoPath={repoPath} {...tab.payload} refs={refs} />;
          break;
        case "commitDiff":
          child = <CommitDiffTab repoPath={repoPath} {...tab.payload} />;
          break;
        default:
          assertNever(tab);
          break;
      }
      return (
        <CommandGroupTreeProvider name={tab.id} enabled={active}>
          {child}
        </CommandGroupTreeProvider>
      );
    },
    [repoPath, refs]
  );
  const selectTab = useSetAtom(selectRepoTabAtom);
  const closeTab = useSetAtom(removeRepoTabAtom);
  const selectNextTab = useSetAtom(selectNextRepoTabAtom);
  const selectPrevTab = useSetAtom(selectPreviousRepoTabAtom);
  const reloadRepository = useReloadRepository();
  const titleBarActions: IconActionItem[] = useMemo(
    () => [
      {
        id: "toggleConsole",
        label: "Show / hide interactive shell",
        icon: "mdi:console",
        disabled: !config.interactiveShell,
        handler: toggleInteractiveShell
      },
      {
        id: "reload",
        label: "Reload repository",
        icon: "mdi:reload",
        handler: reloadRepository
      }
    ],
    [config.interactiveShell, toggleInteractiveShell, reloadRepository]
  );
  if (!repoPath || !tabs) {
    return <></>;
  }
  return (
    <>
      {active && <MainWindowProperty title={repoPath} titleBarActions={titleBarActions} />}
      <CommandGroup name="RepositoryPage">
        <Cmd name="NextTab" hotkey="Ctrl+Tab" handler={selectNextTab} />
        <Cmd name="PrevTab" hotkey="Ctrl+Shift+Tab" handler={selectPrevTab} />
        <Cmd name="CloseTab" hotkey="Ctrl+F4" handler={closeTab} />
        <Cmd name="ToggleShell" hotkey="Ctrl+T" handler={toggleInteractiveShell} />
        <Cmd name="ReloadRepository" hotkey="Ctrl+R" handler={reloadRepository} />
      </CommandGroup>
      <PersistSplitterPanel
        persistKey="repository"
        initialDirection="horiz"
        initialRatio={0.7}
        showSecondPanel={interactiveShell && !!config.interactiveShell}
        allowDirectionChange
        firstPanelMinSize="20%"
        secondPanelMinSize="20%"
        first={
          <TabContainer
            tabs={tabs.tabs}
            currentTabIndex={tabs.currentIndex}
            renderTabContent={renderTabContent}
            renderTabTooltip={renderTabTooltip}
            selectTab={selectTab}
            closeTab={closeTab}
          />
        }
        second={
          <InteractiveShell
            open={interactiveShell && !!config.interactiveShell}
            commandLine={config.interactiveShell!}
            repoPath={repoPath}
            hide={hideInteractiveShell}
            fontFamily={config.fontFamily.monospace}
          />
        }
      />
    </>
  );
};

const RepositoryPageTab: React.FC<{ path: string; active: boolean }> = ({ path, active }) => {
  const store = useAtomValue(repositoryStoresAtomFamily(path));
  useEffect(() => {
    return () => {
      invokeTauriCommand("close_repository", { repoPath: path });
      repositoryStoresAtomFamily.remove(path);
    };
  }, [path]);
  return (
    <Provider store={store}>
      <DevTools store={store} />
      <RepositoryPage active={active} />
    </Provider>
  );
};

export default RepositoryPageTab;
