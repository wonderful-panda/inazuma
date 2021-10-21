import "xterm/css/xterm.css";
import Home from "./components/home";
import ReactDOM from "react-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";
import RepositoryPage from "./components/repository";
import { blue, green, lime, orange, red, yellow } from "@material-ui/core/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import { setup as setupMonaco } from "./monaco";
import { Suspense } from "react";
import browserApi from "./browserApi";
import {
  loadStateToSessionStorage,
  persistDataPromise,
  saveStateToEnvFile,
  STORAGE_PREFIX
} from "./persistData";
import { getCssVariable, setCssVariable } from "./cssvar";
import store, { useSelector, watch } from "./store";
import { Provider } from "react-redux";
import { RESET_RECENT_OPENED_REPOSITORIES, UPDATE_CONFIG } from "./store/persist";
import { CommandGroupProvider } from "./context/CommandGroupContext";

setupMonaco();

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");
const updateFont = (fontFamily: { standard?: string; monospace?: string }) => {
  setCssVariable("--inazuma-standard-fontfamily", fontFamily.standard || defaultFontfamily);
  setCssVariable("--inazuma-monospace-fontfamily", fontFamily.monospace || monospaceFontfamily);
};

const init = async () => {
  await loadStateToSessionStorage();
  window.addEventListener("beforeunload", () => {
    saveStateToEnvFile();
  });
  const { config, environment } = await persistDataPromise;
  store.dispatch(UPDATE_CONFIG(config));
  updateFont(config.fontFamily);
  store.dispatch(RESET_RECENT_OPENED_REPOSITORIES(environment.recentOpened || []));

  // TODO: unify with talwind.config.js
  const muiTheme = createTheme({
    palette: {
      primary: {
        main: lime.A700
      },
      secondary: {
        main: yellow.A700
      },
      error: {
        main: red[700]
      },
      warning: {
        main: orange[700]
      },
      success: {
        main: green[700]
      },
      info: {
        main: blue[700]
      },
      background: {
        default: "#222",
        paper: "#333"
      },
      type: "dark"
    },
    typography: {
      fontFamily: "inherit"
    },
    overrides: {
      MuiListItemIcon: {
        root: {
          minWidth: "40px"
        }
      }
    }
  });
  watch(
    (state) => state.persist.config,
    (newValue) => {
      browserApi.resetConfig(newValue);
      updateFont(newValue.fontFamily);
    }
  );
  watch(
    (state) => state.persist.env.recentOpenedRepositories,
    (newValue) => browserApi.saveEnvironment("recentOpened", newValue)
  );
  const App = () => {
    const repoPath = useSelector((state) => state.repository.path);
    return (
      <ThemeProvider theme={muiTheme}>
        <CommandGroupProvider>
          <PersistStateProvider storage={sessionStorage} prefix={STORAGE_PREFIX}>
            {repoPath ? <RepositoryPage /> : <Home />}
          </PersistStateProvider>
        </CommandGroupProvider>
      </ThemeProvider>
    );
  };

  ReactDOM.render(
    <Provider store={store}>
      <Suspense fallback={<></>}>
        <App />
      </Suspense>
    </Provider>,
    document.getElementById("app")
  );
};

init();
