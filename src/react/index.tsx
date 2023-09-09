import "xterm/css/xterm.css";
import "./install-polyfill";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Home from "./components/home";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material";
import { lime, yellow } from "@mui/material/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import { getCssVariable, setCssVariable } from "./cssvar";
import { CommandGroupProvider } from "./context/CommandGroupContext";
import { Loading } from "./components/Loading";
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
import { useOpenRepository, useReloadRepository, useRepoPathValue } from "./state/repository";
import { useWithRef } from "./hooks/useWithRef";

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

const App = ({ startupRepository }: { startupRepository: string | undefined }) => {
  const repoPath = useRepoPathValue();
  const config = useConfigValue();
  const [, openRepositoryRef] = useWithRef(useOpenRepository());
  const [, reloadRepositoryRef] = useWithRef(useReloadRepository());
  const theme = useMemo(() => createMuiTheme(config.fontSize), [config.fontSize]);
  const reportError = useReportError();
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    listen<null>("request_reload", () => {
      reloadRepositoryRef.current();
    }).then((unlisten) => {
      window.addEventListener("unload", unlisten);
    });
  }, [reloadRepositoryRef]);
  useEffect(() => {
    (async () => {
      if (startupRepository) {
        await openRepositoryRef.current(startupRepository);
      }
    })()
      .catch((error) => reportError({ error }))
      .finally(() => setInitializing(false));
  }, [startupRepository, openRepositoryRef, reportError]);

  useEffect(() => {
    setTimeout(() => {
      let title: string = "Inazuma";
      if (repoPath) {
        title += ` (${repoPath})`;
        window.location.hash = `#${encodeURI(repoPath)}`;
      } else {
        window.location.hash = "#home";
      }
      invokeTauriCommand("set_window_title", { title });
    }, 0);
  }, [repoPath]);

  const content = useMemo(() => {
    if (initializing) {
      return <Loading open />;
    } else if (repoPath) {
      return <RepositoryPage />;
    } else {
      return <Home />;
    }
  }, [initializing, repoPath]);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CommandGroupProvider>
          <ContextMenuProvider>
            <PersistStateProvider storage={displayStateStorage} prefix="inazuma:">
              {content}
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
  const unwatch1 = registerConfigWatcher((value) => {
    invokeTauriCommand("save_config", { newConfig: value });
    updateFont(value.fontFamily);
    updateFontSize(value.fontSize);
  });
  const unwatch2 = registerRecentOpenedRepositoriesWatcher((value) =>
    invokeTauriCommand("store_recent_opened", { newList: value })
  );
  window.addEventListener("unload", () => {
    unwatch1();
    unwatch2();
  });

  const hash = window.location.hash ? decodeURI(window.location.hash.slice(1)) : undefined;
  window.location.hash = "#home";
  const startupRepository = await getInitialRepository(hash);
  const root = createRoot(document.getElementById("app")!);

  root.render(<App startupRepository={startupRepository} />);
})();
