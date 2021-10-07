import Home from "./components/home";
import ReactDOM from "react-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";
import { Provider } from "react-redux";
import store, { useSelector, watch } from "./store";
import useBrowserProcess from "./hooks/useBrowserProcess";
import { UPDATE_CONFIG } from "./store/config";
import RepositoryPage from "./components/repository";
import { getCssVariable, setCssVariable } from "./cssvar";
import { AlertProvider } from "./context/AlertContext";
import { SET_RECENT_OPENED_ENTRIES } from "./store/repository";
import { blue, green, lime, orange, red, yellow } from "@material-ui/core/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import { setup as setupMonaco } from "./monaco";

setupMonaco();

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");

const init = async () => {
  const updateFont = (config: Config) => {
    setCssVariable(
      "--inazuma-standard-fontfamily",
      config.fontFamily.standard || defaultFontfamily
    );
    setCssVariable(
      "--inazuma-monospace-fontfamily",
      config.fontFamily.monospace || monospaceFontfamily
    );
  };
  const browserProcess = useBrowserProcess();
  const {
    config,
    environment: { recentOpened, state }
  } = await browserProcess.loadPersistentData();
  store.dispatch(UPDATE_CONFIG(config));
  updateFont(config);
  if (recentOpened) {
    store.dispatch(SET_RECENT_OPENED_ENTRIES(recentOpened));
  }
  if (state) {
    // restore sessionStorage from envorinment.json
    // The reason why we don't use localStorege is
    // localStorage prevents multiple instance run at same time.
    Object.getOwnPropertyNames(state).forEach((key) => {
      sessionStorage.setItem(key, state[key]);
    });
  }
  window.addEventListener("beforeunload", () => {
    // save sessionStorage to envorinment.json
    const state: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; ++i) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("inazuma:")) {
        state[key] = sessionStorage.getItem(key)!;
      }
    }
    browserProcess.saveEnvironment("state", state);
  });
  watch(
    (state) => state.config,
    (config) => {
      browserProcess.resetConfig(config);
      updateFont(config);
    }
  );
  watch(
    (state) => state.repository.recentOpened,
    (recentOpened) => browserProcess.saveEnvironment("recentOpened", recentOpened)
  );
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
  const App = () => {
    const repoPath = useSelector((state) => state.repository.repoPath);
    return (
      <ThemeProvider theme={muiTheme}>
        <AlertProvider>
          <PersistStateProvider storage={sessionStorage} prefix="inazuma:">
            {repoPath ? <RepositoryPage path={repoPath} /> : <Home />}
          </PersistStateProvider>
        </AlertProvider>
      </ThemeProvider>
    );
  };

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("app")
  );
};

init();
