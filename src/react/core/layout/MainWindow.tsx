import type { RepositoryConfig } from "@backend/RepositoryConfig";
import {
  Drawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { atom, useAtomValue, useSetAtom } from "jotai";
import type React from "react";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { useConfig } from "@/core/state/root";
import { useAppTabsValue } from "@/core/state/tabs";
import { useAboutDialog } from "@/features/about/components/AboutDialog";
import { usePreferenceDialog } from "@/features/preferences/components/PreferenceDialog";
import type { IconActionItem, Spacer } from "@/features/repository/commands/types";
import {
  repoConfigAtom,
  repositoryStoresAtomFamily,
  saveRepoConfigAtom
} from "@/features/repository/state";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Cmd, CommandGroup } from "@/shared/components/ui/CommandGroup";
import { Icon } from "@/shared/components/ui/Icon";
import { nope } from "@/util";

export interface MainWindowProps {
  title: string;
  drawerItems?: readonly IconActionItem[];
  titleBarActions?: readonly (IconActionItem | Spacer)[];
}

interface ApplicationDrawerProps {
  opened: boolean;
  close: () => void;
  items: readonly IconActionItem[];
}

const ApplicationDrawerInner: React.FC<ApplicationDrawerProps> = ({ opened, close, items }) => {
  return (
    <Drawer anchor="left" open={opened} onClose={close}>
      <Typography variant="h6" component="div">
        <div className="w-52 pt-5" onClick={close}>
          {items.map((item) => (
            <ListItem dense key={item.id} disablePadding>
              <ListItemButton disabled={item.disabled} onClick={item.handler}>
                <ListItemIcon>
                  <Icon className="text-2xl" icon={item.icon} />
                </ListItemIcon>
                <ListItemText primary={item.label} disableTypography />
              </ListItemButton>
            </ListItem>
          ))}{" "}
        </div>{" "}
      </Typography>
    </Drawer>
  );
};
const ApplicationDrawer = memo(ApplicationDrawerInner);

const MainWindowPropsValueContext = createContext<MainWindowProps>({ title: "" });
const MainWindowPropsSetterContext = createContext<(value: MainWindowProps) => void>(nope);

export const MainWindowProperty: React.FC<MainWindowProps> = ({
  title,
  titleBarActions,
  drawerItems
}) => {
  const setProps = useContext(MainWindowPropsSetterContext);
  useLayoutEffect(() => {
    setProps({ title, titleBarActions, drawerItems });
  }, [setProps, title, titleBarActions, drawerItems]);
  return null;
};

export const MainWindow: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpened(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpened(false);
  }, []);
  const [config, setConfig] = useConfig();
  const [props, setProps] = useState<MainWindowProps>({ title: "" });
  const openPreference = usePreferenceDialog();
  const openAbout = useAboutDialog();

  // Get current repository and its config
  const appTabs = useAppTabsValue();
  const currentTab = appTabs.tabs[appTabs.currentIndex];
  const repoPath = currentTab?.type === "repository" ? currentTab.payload.path : null;

  const repoStore = useAtomValue(repoPath ? repositoryStoresAtomFamily(repoPath) : atom(undefined));

  const repoConfig = useAtomValue(repoConfigAtom, { store: repoStore });
  const saveRepoConfig = useSetAtom(saveRepoConfigAtom, { store: repoStore });

  const handleRepoConfigChange = useCallback(
    async (newConfig: RepositoryConfig) => {
      await saveRepoConfig(newConfig);
    },
    [saveRepoConfig]
  );

  const callbacks = useMemo(
    () => ({
      openPreference: () =>
        void openPreference({
          config,
          onConfigChange: setConfig,
          repoConfig,
          onRepoConfigChange: handleRepoConfigChange
        }),
      openAbout: () => void openAbout(),
      changeFontSize: () => {
        setConfig((prev) => {
          const fontSizeList: FontSize[] = ["x-small", "small", "medium"];
          const fontSize = fontSizeList[(fontSizeList.indexOf(prev.fontSize) + 1) % 3] ?? "x-small";
          return { ...prev, fontSize };
        });
      },
      openDevtools: () => void invokeTauriCommand("open_devtools")
    }),
    [config, setConfig, repoConfig, handleRepoConfigChange, openPreference, openAbout]
  );

  const drawerItems = useMemo<readonly IconActionItem[]>(
    () => [
      ...(props.drawerItems ?? []),
      {
        id: "preference",
        label: "Preference",
        icon: "mdi:cog",
        handler: callbacks.openPreference
      },
      {
        id: "about",
        label: "About",
        icon: "mdi:information-outline",
        handler: callbacks.openAbout
      }
    ],
    [props.drawerItems, callbacks]
  );
  return (
    <MainWindowPropsValueContext.Provider value={props}>
      <MainWindowPropsSetterContext.Provider value={setProps}>
        <div className="absolute left-0 right-0 top-0 bottom-0 flex box-border m-0">
          <CommandGroup name="main">
            <Cmd name="ChangeFontSize" hotkey="Ctrl+Alt+F" handler={callbacks.changeFontSize} />
            <Cmd name="Preference" hotkey="Ctrl+Shift+P" handler={callbacks.openPreference} />
            <Cmd name="About" hotkey="Ctrl+Shift+V" handler={callbacks.openAbout} />
          </CommandGroup>
          <div className="absolute left-0 right-0 top-0 h-9 leading-9 pr-2 flex-row-nowrap bg-titlebar text-xl">
            <IconButton className="p-0 w-9" onClick={openDrawer} size="large">
              <Icon icon="mdi:menu" />
            </IconButton>
            <span className="flex-1">{props.title}</span>
            {props.titleBarActions?.map((a, i) =>
              typeof a === "string" ? (
                <div key={`__spacer__${i}`} className={a} />
              ) : (
                <IconButton
                  key={a.id}
                  title={a.label}
                  disabled={a.disabled}
                  className="p-0 w-9"
                  onClick={a.handler}
                  size="large"
                >
                  <Icon className="text-2xl text-inherit" icon={a.icon} />
                </IconButton>
              )
            )}
            {import.meta.env.DEV && (
              <IconButton
                title="Show devtools"
                className="p-0 w-9"
                onClick={callbacks.openDevtools}
                size="large"
              >
                <Icon className="text-2xl text-inherit" icon="mdi:tools" />
              </IconButton>
            )}
          </div>
          <ApplicationDrawer opened={drawerOpened} close={closeDrawer} items={drawerItems} />
          <div className="absolute left-0 right-0 top-9 bottom-0 flex box-border p-1">
            {children}
          </div>
        </div>
      </MainWindowPropsSetterContext.Provider>
    </MainWindowPropsValueContext.Provider>
  );
};
