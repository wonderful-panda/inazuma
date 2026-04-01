import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { createStore } from "jotai";
import { Provider, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { CommandGroupTreeProvider } from "@/core/context/CommandGroupContext";
import { DialogProvider } from "@/core/context/DialogContext";
import { MainWindowProperty } from "@/core/layout/MainWindow";
import { useConfigValue } from "@/core/state/root";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import type { IconActionItem, Spacer } from "@/features/repository/commands/types";
import { useBeginFetch } from "@/features/repository/hooks/actions/fetch";
import { useBeginPull } from "@/features/repository/hooks/actions/pull";
import { useBeginPush } from "@/features/repository/hooks/actions/push";
import { logAtom, repoPathAtom, repositoryStoresAtomFamily } from "@/features/repository/state";
import {
  hideInteractiveShellAtom,
  interactiveShellAtom,
  toggleInteractiveShellAtom,
  toggleReflogAtom
} from "@/features/repository/state/misc";
import {
  removeRepoTabAtom,
  repoTabsAtom,
  selectNextRepoTabAtom,
  selectPreviousRepoTabAtom,
  selectRepoTabAtom,
  type TabType
} from "@/features/repository/state/tabs";
import { lazy } from "@/shared/components/hoc/lazy";
import { InteractiveShell } from "@/shared/components/shell/InteractiveShell";
import { Cmd, CommandGroup } from "@/shared/components/ui/CommandGroup";
import { PersistSplitterPanel } from "@/shared/components/ui/layout/PersistSplitterPanel";
import {
  TabContainer,
  type TabContainerProps,
  TooltipTitle
} from "@/shared/components/ui/layout/TabContainer";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { assertNever } from "@/shared/utils/util";
import BlameTabTooltip from "./components/BlameTabTooltip";
import CommitDiffTabTooltip from "./components/CommitDiffTabTooltip";
import CommitLog from "./components/CommitLog";
import LsTreeTabTooltip from "./components/LsTreeTabTooltip";
import { useLoadRepositoryIfNotYet, useReloadRepository } from "./hooks/actions/openRepository";

const DevTools = (
  import.meta.env.DEV ? lazy(() => import("jotai-devtools").then((m) => m.DevTools)) : () => null
) as React.FC<{ store?: ReturnType<typeof createStore> }>;

const opt = { preload: true };
const BlameTab = lazy(async () => (await import("./components/BlameTab")).default, opt);
const LsTreeTab = lazy(async () => (await import("./components/LsTreeTab")).default, opt);
const CommitDiffTab = lazy(async () => (await import("./components/CommitDiffTab")).default, opt);

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
  const toggleReflog = useSetAtom(toggleReflogAtom);
  const config = useConfigValue();
  const loadRepositoryIfNotYet = useLoadRepositoryIfNotYet();
  useEffect(() => {
    void loadRepositoryIfNotYet();
  }, [loadRepositoryIfNotYet]);
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>(
    (tab, active) => {
      if (!repoPath || !tab) {
        return null;
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
  const beginPush = useBeginPush();
  const beginFetch = useBeginFetch();
  const beginPull = useBeginPull();

  const beginPushCurrentBranch = useCallbackWithErrorHandler(async () => {
    const branchName = await invokeTauriCommand("get_current_branch", { repoPath });
    await beginPush(branchName);
  }, [beginPush, repoPath]);

  const titleBarActions: (IconActionItem | Spacer)[] = useMemo(
    () => [
      {
        id: "fetch",
        label: "Fetch from remote repository",
        icon: "mdi:download-outline",
        handler: beginFetch
      },
      {
        id: "pull",
        label: "Pull(fetch and merge) from remote repository",
        icon: "mdi:download",
        handler: beginPull
      },
      {
        id: "push",
        label: "Push to remote repository",
        icon: "mdi:upload",
        handler: beginPushCurrentBranch
      },
      "w-8" as Spacer,
      {
        id: "toggleReflog",
        label: "Show / hide reflog",
        icon: "mdi:history",
        handler: () => {
          toggleReflog();
          void reloadRepository();
        }
      },
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
    [
      config.interactiveShell,
      beginPushCurrentBranch,
      beginFetch,
      beginPull,
      toggleReflog,
      toggleInteractiveShell,
      reloadRepository
    ]
  );
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

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic refetching for deterministic Tauri commands
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Keep data in cache for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        retry: false
      }
    }
  });

const RepositoryPageTab: React.FC<{ path: string; active: boolean }> = ({ path, active }) => {
  const store = useAtomValue(repositoryStoresAtomFamily(path));
  const queryClient = useMemo(createQueryClient, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <DevTools store={store} />
        <DialogProvider>
          <RepositoryPage active={active} />
        </DialogProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default RepositoryPageTab;
