import IconButton from "@mui/material/IconButton";
import { Icon } from "./Icon";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
  useLayoutEffect
} from "react";
import {
  Drawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import { PreferenceDialog } from "./PreferenceDialog";
import { AboutDialog } from "./AboutDialog";
import { TopLayerLoading } from "./Loading";
import { Alert as RawAlert } from "./Alert";
import { CommandGroup, Cmd } from "./CommandGroup";
import { IconActionItem } from "@/commands/types";
import { useAlertValue, useConfig, useHideAlert, useIsLoadingValue } from "@/state/root";
import { nope } from "@/util";

export interface MainWindowProps {
  title: string;
  drawerItems?: readonly IconActionItem[];
  titleBarActions?: readonly IconActionItem[];
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

const Alert: React.FC = () => {
  const hideAlert = useHideAlert();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AlertType>("info");
  const [message, setMessage] = useState("");
  const alert = useAlertValue();
  useEffect(() => {
    setOpen(false);
    if (!alert) {
      return;
    }
    setTimeout(() => {
      setType(alert.type);
      setMessage(alert.message);
      setOpen(true);
    }, 200);
  }, [alert]);
  return <RawAlert open={open} type={type} message={message} onClose={hideAlert} />;
};

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
  return <></>;
};

export const MainWindow: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isLoading = useIsLoadingValue();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpened(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpened(false);
  }, []);
  const [config, setConfig] = useConfig();
  const preferenceDialogRef = useRef({} as ComponentRef<typeof PreferenceDialog>);
  const aboutDialogRef = useRef({} as ComponentRef<typeof AboutDialog>);
  const [props, setProps] = useState<MainWindowProps>({ title: "" });
  const callbacks = useMemo(
    () => ({
      openPreference: () => preferenceDialogRef.current.open(),
      openAbout: () => aboutDialogRef.current.open(),
      changeFontSize: () => {
        setConfig((prev) => {
          const fontSizeList: FontSize[] = ["x-small", "small", "medium"];
          const fontSize = fontSizeList[(fontSizeList.indexOf(prev.fontSize) + 1) % 3] ?? "x-small";
          return { ...prev, fontSize };
        });
      }
    }),
    [setConfig]
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
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isLoading) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isLoading]
  );
  return (
    <MainWindowPropsValueContext.Provider value={props}>
      <MainWindowPropsSetterContext.Provider value={setProps}>
        <div
          className="absolute left-0 right-0 top-0 bottom-0 flex box-border m-0"
          onKeyDown={onKeyDown}
        >
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
            {props.titleBarActions?.map((a) => (
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
            ))}
          </div>
          <ApplicationDrawer opened={drawerOpened} close={closeDrawer} items={drawerItems} />
          <div className="absolute left-0 right-0 top-9 bottom-0 flex box-border p-1">
            {children}
          </div>
          <PreferenceDialog ref={preferenceDialogRef} config={config} onConfigChange={setConfig} />
          <AboutDialog ref={aboutDialogRef} />
          <TopLayerLoading open={isLoading} />
          <Alert />
        </div>
      </MainWindowPropsSetterContext.Provider>
    </MainWindowPropsValueContext.Provider>
  );
};
