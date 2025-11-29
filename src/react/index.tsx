import "@xterm/xterm/css/xterm.css";
import "./install-polyfill";
import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { lime, yellow } from "@mui/material/colors";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Cmd, CommandGroup } from "./components/CommandGroup";
import { lazy } from "./components/hoc/lazy";
import Home from "./components/home";
import { MainWindow } from "./components/MainWindow";
import { TabContainer, type TabContainerProps, TooltipTitle } from "./components/TabContainer";
import { AlertProvider, useAlert } from "./context/AlertContext";
import { CommandGroupProvider, CommandGroupTreeProvider } from "./context/CommandGroupContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { ContextMenuProvider } from "./context/ContextMenuContext";
import { DialogProvider } from "./context/DialogContext";
import { LoadingProvider } from "./context/LoadingContext";
import { PersistStateProvider } from "./context/PersistStateContext";
import { getCssVariable, setCssVariable } from "./cssvar";
import { useOpenRepository, useReloadSpecifiedRepository } from "./hooks/actions/openRepository";
import { useWithRef } from "./hooks/useWithRef";
import { invokeTauriCommand } from "./invokeTauriCommand";
import {
  registerConfigWatcher,
  registerRecentOpenedRepositoriesWatcher,
  setInitialValue,
  useConfigValue
} from "./state/root";
import {
  type AppTabType,
  registerApplicationTabsWatcher,
  removeAppTab,
  selectAppTab,
  selectHomeTab,
  selectNextAppTab,
  selectPrevAppTab,
  setInitialValue as setInitialAppTabsValue,
  type TabsState,
  useAppTabsValue
} from "./state/tabs";
import { createStateStorage, type StateStorage } from "./stateStorage";
import { assertNever } from "./util";

if (import.meta.env.DEV) {
  void import("./jotai-devtools-styles");
}

const RepositoryPage = lazy(async () => (await import("./components/repository")).default, {
  preload: true
});

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");
const updateFont = (fontFamily: FontFamily) => {
  setCssVariable("--inazuma-standard-fontfamily", fontFamily.standard ?? defaultFontfamily);
  setCssVariable("--inazuma-monospace-fontfamily", fontFamily.monospace ?? monospaceFontfamily);
};
const fontSizeNumber = {
  "x-small": 12,
  small: 14,
  medium: 16
};

const updateFontSize = (fontSize: FontSize) => {
  setCssVariable("--inazuma-font-size", `${fontSizeNumber[fontSize]}px`);
};

const createMuiTheme = (baseFontSize: FontSize) =>
  createTheme({
    palette: {
      primary: {
        main: lime.A700
      },
      secondary: {
        main: yellow.A700
      },
      background: {
        default: "#222",
        paper: "#333"
      },
      mode: "dark"
    },
    typography: {
      fontFamily: "inherit"
    },
    components: {
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: `${fontSizeNumber[baseFontSize] * 2.5}px`
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      }
    },
    custom: {
      baseFontSize: fontSizeNumber[baseFontSize]
    }
  });

const getInitialRepository = async (hash: string | undefined) => {
  if (hash === "home") {
    return undefined;
  } else if (!hash) {
    return await invokeTauriCommand("find_repository_root");
  } else {
    return hash;
  }
};

const Content: React.FC = () => {
  const tabs = useAppTabsValue();
  const renderTabContent = useCallback<TabContainerProps<AppTabType>["renderTabContent"]>(
    (tab, active) => {
      let child: React.ReactNode;
      switch (tab.type) {
        case "home":
          child = <Home active={active} />;
          break;
        case "repository":
          child = <RepositoryPage active={active} path={tab.payload.path} />;
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
    []
  );
  const renderTabTooltip = useCallback<TabContainerProps<AppTabType>["renderTabTooltip"]>((tab) => {
    switch (tab.type) {
      case "home":
        return <TooltipTitle text="Home" />;
      case "repository":
        return (
          <>
            <TooltipTitle text="Repository" />
            <span className="ml-2 font-mono">{tab.payload.path}</span>
          </>
        );
      default:
        assertNever(tab);
        return "";
    }
  }, []);

  return (
    <>
      <CommandGroup name="root">
        <Cmd name="SelectNextAppTab" handler={selectNextAppTab} hotkey="Ctrl+ArrowRight" />
        <Cmd name="SelectPrevAppTab" handler={selectPrevAppTab} hotkey="Ctrl+ArrowLeft" />
        <Cmd name="SelectHomeTab" hotkey="Ctrl+H" handler={selectHomeTab} />
      </CommandGroup>
      <TabContainer
        tabs={tabs.tabs}
        currentTabIndex={tabs.currentIndex}
        renderTabContent={renderTabContent}
        renderTabTooltip={renderTabTooltip}
        selectTab={selectAppTab}
        closeTab={removeAppTab}
      />
    </>
  );
};
const App = ({
  startupRepository,
  stateStorage
}: {
  startupRepository: string | undefined;
  stateStorage: StateStorage;
}) => {
  const config = useConfigValue();
  const [, openRepository] = useWithRef(useOpenRepository());
  const reloadRepository = useReloadSpecifiedRepository();
  const theme = useMemo(() => createMuiTheme(config.fontSize), [config.fontSize]);
  const [, reportError] = useWithRef(useAlert().reportError);
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    void listen<string>("request_reload", (e) => {
      void reloadRepository(e.payload);
    }).then((unlisten) => {
      window.addEventListener("unload", unlisten);
    });
  }, [reloadRepository]);
  useEffect(() => {
    (async () => {
      if (startupRepository) {
        await openRepository.current(startupRepository);
      }
    })()
      .catch((error) => reportError.current({ error }))
      .finally(() => setInitializing(false));
  }, [startupRepository]);

  const content = useMemo(() => {
    if (initializing) {
      return null;
    } else {
      return <Content />;
    }
  }, [initializing]);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CommandGroupProvider>
          <ContextMenuProvider>
            <PersistStateProvider storage={stateStorage}>
              <ConfirmDialogProvider>
                <AlertProvider>
                  <LoadingProvider>
                    <DialogProvider>
                      <MainWindow>{content}</MainWindow>
                    </DialogProvider>
                  </LoadingProvider>
                </AlertProvider>
              </ConfirmDialogProvider>
            </PersistStateProvider>
          </ContextMenuProvider>
        </CommandGroupProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

void (async () => {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  const [config, environment] = await invokeTauriCommand("load_persist_data");
  updateFont(config.fontFamily);
  updateFontSize(config.fontSize);
  const stateStorage = createStateStorage("inazuma:", environment.state || {});
  setInitialValue(config, environment.recentOpened || []);
  const appTabsJsonString = sessionStorage.getItem("applicationTabs");
  if (appTabsJsonString) {
    console.debug(appTabsJsonString);
    setInitialAppTabsValue(JSON.parse(appTabsJsonString) as TabsState<AppTabType>);
  }
  const unwatch1 = registerConfigWatcher((value) => {
    void invokeTauriCommand("save_config", { newConfig: value });
    updateFont(value.fontFamily);
    updateFontSize(value.fontSize);
  });
  const unwatch2 = registerRecentOpenedRepositoriesWatcher(
    (value) => void invokeTauriCommand("store_recent_opened", { newList: value })
  );
  const unwatch3 = registerApplicationTabsWatcher((value) =>
    sessionStorage.setItem("applicationTabs", JSON.stringify(value))
  );

  window.addEventListener("unload", () => {
    unwatch1();
    unwatch2();
    unwatch3();
  });

  const hash = window.location.hash ? decodeURI(window.location.hash.slice(1)) : undefined;
  window.location.hash = "#home";
  const startupRepository = await getInitialRepository(hash);

  const root = createRoot(document.getElementById("app")!);

  root.render(<App startupRepository={startupRepository} stateStorage={stateStorage} />);
})();
