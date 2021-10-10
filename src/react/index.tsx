import Home from "./components/home";
import ReactDOM from "react-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";
import RepositoryPage from "./components/repository";
import { AlertProvider } from "./context/AlertContext";
import { blue, green, lime, orange, red, yellow } from "@material-ui/core/colors";
import { PersistStateProvider } from "./context/PersistStateContext";
import { setup as setupMonaco } from "./monaco";
import { RecoilRoot, useRecoilValue } from "recoil";
import { config$, recentOpenedRepositories$ } from "./state/persist";
import { Suspense, useEffect, useLayoutEffect } from "react";
import browserApi from "./browserApi";
import { repositoryPath$ } from "./state/repository";
import { loadStateToSessionStorage, saveStateToEnvFile, STORAGE_PREFIX } from "./persistData";
import { getCssVariable, setCssVariable } from "./cssvar";

setupMonaco();

const defaultFontfamily = getCssVariable("--inazuma-standard-fontfamily");
const monospaceFontfamily = getCssVariable("--inazuma-monospace-fontfamily");
const updateFont = (standard: string | undefined, monospace: string | undefined) => {
  setCssVariable("--inazuma-standard-fontfamily", standard || defaultFontfamily);
  setCssVariable("--inazuma-monospace-fontfamily", monospace || monospaceFontfamily);
};

const init = async () => {
  await loadStateToSessionStorage();
  window.addEventListener("beforeunload", () => {
    saveStateToEnvFile();
  });
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
    const repoPath = useRecoilValue(repositoryPath$);
    return (
      <ThemeProvider theme={muiTheme}>
        <AlertProvider>
          <PersistStateProvider storage={sessionStorage} prefix={STORAGE_PREFIX}>
            {repoPath ? <RepositoryPage path={repoPath} /> : <Home />}
          </PersistStateProvider>
        </AlertProvider>
      </ThemeProvider>
    );
  };
  const Watch = () => {
    const config = useRecoilValue(config$);
    const recentOpened = useRecoilValue(recentOpenedRepositories$);
    useLayoutEffect(() => {
      updateFont(config.fontFamily.standard, config.fontFamily.monospace);
    }, [config.fontFamily.standard, config.fontFamily.monospace]);
    useEffect(() => {
      browserApi.resetConfig(config);
    }, [config]);
    useEffect(() => {
      browserApi.saveEnvironment("recentOpened", recentOpened);
    }, [recentOpened]);
    return <></>;
  };

  ReactDOM.render(
    <RecoilRoot>
      <Suspense fallback={<></>}>
        <Watch />
        <App />
      </Suspense>
    </RecoilRoot>,
    document.getElementById("app")
  );
};

init();
