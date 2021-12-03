import "xterm/css/xterm.css";
import { Suspense, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import Home from "./components/home";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material";
import { lime, yellow } from "@mui/material/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import {
  loadStateToSessionStorage,
  persistDataPromise,
  saveStateToEnvFile,
  STORAGE_PREFIX
} from "./persistData";
import { getCssVariable, setCssVariable } from "./cssvar";
import store, { Dispatch, useSelector, watch } from "./store";
import { Provider, useDispatch } from "react-redux";
import { RESET_RECENT_OPENED_REPOSITORIES, UPDATE_CONFIG } from "./store/persist";
import { CommandGroupProvider } from "./context/CommandGroupContext";
import { OPEN_REPOSITORY } from "./store/thunk/openRepository";
import { Loading } from "./components/Loading";
import { SHOW_ERROR } from "./store/misc";
import { serializeError } from "./util";
import { ContextMenuProvider } from "./context/ContextMenuContext";
import { lazyWithPreload } from "./components/lazyWithPreload";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { dispatchBrowser } from "./dispatchBrowser";

const RepositoryPage = lazyWithPreload(() => import("./components/repository"));

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");
const updateFont = (fontFamily: { standard?: string; monospace?: string }) => {
  setCssVariable("--inazuma-standard-fontfamily", fontFamily.standard || defaultFontfamily);
  setCssVariable("--inazuma-monospace-fontfamily", fontFamily.monospace || monospaceFontfamily);
};
const fontSizeNumber = {
  "x-small": 10,
  small: 12,
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

const init = async (dispatch: Dispatch) => {
  await loadStateToSessionStorage();
  window.addEventListener("beforeunload", () => {
    saveStateToEnvFile();
  });
  const { config, environment } = await persistDataPromise;
  dispatch(UPDATE_CONFIG(config));
  updateFont(config.fontFamily);
  updateFontSize(config.fontSize);
  dispatch(RESET_RECENT_OPENED_REPOSITORIES(environment.recentOpened || []));
  const initialRepository = window.location.hash
    ? decodeURI(window.location.hash.slice(1))
    : undefined;
  window.location.hash = "";
  watch(
    (state) => state.persist.config,
    (newValue) => {
      dispatchBrowser("resetConfig", newValue);
      updateFont(newValue.fontFamily);
      updateFontSize(newValue.fontSize);
    }
  );
  watch(
    (state) => state.persist.env.recentOpenedRepositories,
    (newValue) => dispatchBrowser("saveEnvironment", "recentOpened", newValue)
  );
  watch(
    (state) => state.repository.path,
    (newValue) => {
      setTimeout(() => {
        if (newValue) {
          document.title = `Inazuma (${newValue})`;
          window.location.hash = `#${encodeURI(newValue)}`;
        } else {
          document.title = "Inazuma";
          window.location.hash = "";
        }
      }, 0);
    }
  );
  if (initialRepository) {
    await dispatch(OPEN_REPOSITORY(initialRepository));
  }
};

const App = () => {
  const dispatch = useDispatch();
  const fontSize = useSelector((state) => state.persist.config.fontSize);
  const repoPath = useSelector((state) => state.repository.path);
  const theme = useMemo(() => createMuiTheme(fontSize), [fontSize]);
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    init(dispatch)
      .catch((e) => {
        dispatch(SHOW_ERROR({ error: serializeError(e) }));
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [dispatch]);
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
        <Suspense fallback={<Loading open />}>
          <CommandGroupProvider>
            <ContextMenuProvider>
              <PersistStateProvider storage={sessionStorage} prefix={STORAGE_PREFIX}>
                <ConfirmDialogProvider>{content}</ConfirmDialogProvider>
              </PersistStateProvider>
            </ContextMenuProvider>
          </CommandGroupProvider>
        </Suspense>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
