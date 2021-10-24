import "xterm/css/xterm.css";
import Home from "./components/home";
import ReactDOM from "react-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";
import RepositoryPage from "./components/repository";
import { blue, green, lime, orange, red, yellow } from "@material-ui/core/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import { setup as setupMonaco } from "./monaco";
import { useEffect, useMemo, useState } from "react";
import browserApi from "./browserApi";
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
import openRepository from "./store/thunk/openRepository";
import Loading from "./components/Loading";
import { SHOW_ERROR } from "./store/misc";
import { serializeError } from "./util";

setupMonaco();

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");
const updateFont = (fontFamily: { standard?: string; monospace?: string }) => {
  setCssVariable("--inazuma-standard-fontfamily", fontFamily.standard || defaultFontfamily);
  setCssVariable("--inazuma-monospace-fontfamily", fontFamily.monospace || monospaceFontfamily);
};

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

const init = async (dispatch: Dispatch) => {
  await loadStateToSessionStorage();
  window.addEventListener("beforeunload", () => {
    saveStateToEnvFile();
  });
  const { config, environment } = await persistDataPromise;
  dispatch(UPDATE_CONFIG(config));
  updateFont(config.fontFamily);
  dispatch(RESET_RECENT_OPENED_REPOSITORIES(environment.recentOpened || []));
  const initialRepository = window.location.hash
    ? decodeURI(window.location.hash.slice(1))
    : undefined;
  window.location.hash = "";
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
    await dispatch(openRepository(initialRepository));
  }
};

const App = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    init(dispatch)
      .catch((e) => {
        dispatch(SHOW_ERROR({ error: serializeError(e) }));
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);
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
    <ThemeProvider theme={muiTheme}>
      <CommandGroupProvider>
        <PersistStateProvider storage={sessionStorage} prefix={STORAGE_PREFIX}>
          {content}
        </PersistStateProvider>
      </CommandGroupProvider>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
