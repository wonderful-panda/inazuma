import { IconActionItem } from "@/commands/types";
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
import { useConfigValue } from "@/state/root";
import { useCloseRepository, useReloadRepository, useRepoPathValue } from "@/state/repository";
import { useAtomValue, useSetAtom } from "jotai";
import { TabType, logAtom, tabsAtom } from "@/state/repository/premitive";
import {
  removeTabAtom,
  selectNextTabAtom,
  selectPreviousTabAtom,
  selectTabAtom
} from "@/state/repository/tabs";
import { interactiveShellAtom, useInteractiveShell } from "@/state/repository/misc";

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

const RepositoryPage: React.FC = () => {
  const repoPath = useRepoPathValue();
  const tabs = useAtomValue(tabsAtom);
  const refs = useAtomValue(logAtom)?.refs;
  const interactiveShellOpened = useAtomValue(interactiveShellAtom);
  const interactiveShell = useInteractiveShell();
  const config = useConfigValue();
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
  const selectTab = useSetAtom(selectTabAtom);
  const closeTab = useSetAtom(removeTabAtom);
  const selectNextTab = useSetAtom(selectNextTabAtom);
  const selectPrevTab = useSetAtom(selectPreviousTabAtom);
  const closeRepository = useCloseRepository();
  const reloadRepository = useReloadRepository();
  const callbacks = useMemo(
    () => ({
      selectTab,
      closeTab,
      selectNextTab,
      selectPrevTab,
      closeRepository,
      toggleInteractiveShell: interactiveShell.toggle,
      hideInteractiveShell: interactiveShell.hide,
      reloadRepository
    }),
    [
      interactiveShell,
      selectTab,
      closeTab,
      selectNextTab,
      selectPrevTab,
      closeRepository,
      reloadRepository
    ]
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
  const interactiveShellConfigured = !!config.interactiveShell;
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
  if (!repoPath || !tabs) {
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
        showSecondPanel={interactiveShellOpened && !!config.interactiveShell}
        allowDirectionChange
        firstPanelMinSize="20%"
        secondPanelMinSize="20%"
        first={
          <TabContainer
            tabs={tabs.tabs}
            currentTabIndex={tabs.currentIndex}
            renderTabContent={renderTabContent}
            renderTabTooltip={renderTabTooltip}
            selectTab={callbacks.selectTab}
            closeTab={callbacks.closeTab}
          />
        }
        second={
          <InteractiveShell
            open={interactiveShellOpened && !!config.interactiveShell}
            commandLine={config.interactiveShell!}
            repoPath={repoPath}
            hide={callbacks.hideInteractiveShell}
            fontFamily={config.fontFamily.monospace}
          />
        }
      />
    </MainWindow>
  );
};

export default RepositoryPage;
