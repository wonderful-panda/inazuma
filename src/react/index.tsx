import "xterm/css/xterm.css";
import "./install-polyfill";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Home from "./components/home";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material";
import { lime, yellow } from "@mui/material/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import { getCssVariable, setCssVariable } from "./cssvar";
import { CommandGroupProvider, CommandGroupTreeProvider } from "./context/CommandGroupContext";
import { ContextMenuProvider } from "./context/ContextMenuContext";
import { lazy } from "./components/hoc/lazy";
import { invokeTauriCommand } from "./invokeTauriCommand";
import { debounce } from "lodash";
import { listen } from "@tauri-apps/api/event";
import {
  registerConfigWatcher,
  registerRecentOpenedRepositoriesWatcher,
  setInitialValue,
  useConfigValue,
  useReportError
} from "./state/root";
import { useOpenRepository, useReloadSpecifiedRepository } from "./hooks/actions/openRepository";
import { useWithRef } from "./hooks/useWithRef";
import { MainWindow } from "./components/MainWindow";
import {
  AppTabType,
  registerApplicationTabsWatcher,
  useAppTabsValue,
  useRemoveAppTab,
  useSelectAppTab,
  useSelectHomeTab,
  useSelectNextAppTab,
  useSelectPrevAppTab,
  setInitialValue as setInitialAppTabsValue
} from "./state/tabs";
import { TabContainer, TabContainerProps, TooltipTitle } from "./components/TabContainer";
import { assertNever } from "./util";
import { Cmd, CommandGroup } from "./components/CommandGroup";

const RepositoryPage = lazy(() => import("./components/repository"), { preload: true });

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");
const updateFont = (fontFamily: FontFamily) => {
  setCssVariable("--inazuma-standard-fontfamily", fontFamily.standard || defaultFontfamily);
  setCssVariable("--inazuma-monospace-fontfamily", fontFamily.monospace || monospaceFontfamily);
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

const saveDisplayState = debounce((newState: Record<string, string>) => {
  invokeTauriCommand("store_state", { newState }).catch((e) => {
    console.warn("Failed to store display state:", e);
  });
}, 1000);

const displayStateStorage = {
  state: {} as Record<string, string>,
  getItem(key: string) {
    return this.state[key];
  },
  setItem(key: string, value: string) {
    this.state[key] = value;
    saveDisplayState(this.state);
  },
  reset(state: Record<string, string>) {
    this.state = state;
  }
};

const Content: React.FC = () => {
  const tabs = useAppTabsValue();
  const selectTab = useSelectAppTab();
  const selectNextTab = useSelectNextAppTab();
  const selectPrevTab = useSelectPrevAppTab();
  const removeTab = useRemoveAppTab();
  const selectHomeTab = useSelectHomeTab();
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
        <Cmd name="SelectNextAppTab" handler={selectNextTab} hotkey="Ctrl+ArrowRight" />
        <Cmd name="SelectPrevAppTab" handler={selectPrevTab} hotkey="Ctrl+ArrowLeft" />
        <Cmd name="SelectHomeTab" hotkey="Ctrl+H" handler={selectHomeTab} />
      </CommandGroup>
      <TabContainer
        tabs={tabs.tabs}
        currentTabIndex={tabs.currentIndex}
        renderTabContent={renderTabContent}
        renderTabTooltip={renderTabTooltip}
        selectTab={selectTab}
        closeTab={removeTab}
      />
    </>
  );
};
const App = ({ startupRepository }: { startupRepository: string | undefined }) => {
  const config = useConfigValue();
  const [, openRepository] = useWithRef(useOpenRepository());
  const reloadRepository = useReloadSpecifiedRepository();
  const theme = useMemo(() => createMuiTheme(config.fontSize), [config.fontSize]);
  const [, reportError] = useWithRef(useReportError());
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    listen<string>("request_reload", (e) => {
      console.log("request_reload", e);
      reloadRepository(e.payload);
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
  }, [startupRepository, openRepository, reportError]);

  const content = useMemo(() => {
    if (initializing) {
      return <></>;
    } else {
      return <Content />;
    }
  }, [initializing]);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CommandGroupProvider>
          <ContextMenuProvider>
            <PersistStateProvider storage={displayStateStorage} prefix="inazuma:">
              <MainWindow>{content}</MainWindow>
            </PersistStateProvider>
          </ContextMenuProvider>
        </CommandGroupProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

(async () => {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  const [config, environment] = await invokeTauriCommand("load_persist_data");
  updateFont(config.fontFamily);
  updateFontSize(config.fontSize);
  displayStateStorage.reset(environment.state || {});
  setInitialValue(config, environment.recentOpened || []);
  const appTabsJsonString = sessionStorage.getItem("applicationTabs");
  if (appTabsJsonString) {
    console.debug(appTabsJsonString);
    setInitialAppTabsValue(JSON.parse(appTabsJsonString));
  }
  const unwatch1 = registerConfigWatcher((value) => {
    invokeTauriCommand("save_config", { newConfig: value });
    updateFont(value.fontFamily);
    updateFontSize(value.fontSize);
  });
  const unwatch2 = registerRecentOpenedRepositoriesWatcher((value) =>
    invokeTauriCommand("store_recent_opened", { newList: value })
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

  root.render(<App startupRepository={startupRepository} />);
})();
