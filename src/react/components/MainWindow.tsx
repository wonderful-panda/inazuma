import IconButton from "@mui/material/IconButton";
import { Icon } from "./Icon";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { PreferenceDialog } from "./PreferenceDialog";
import { AboutDialog } from "./AboutDialog";
import { Loading } from "./Loading";
import { useDispatch, useSelector } from "@/store";
import { UPDATE_CONFIG } from "@/store/persist";
import { Alert as RawAlert } from "./Alert";
import { HIDE_ALERT } from "@/store/misc";
import { CommandGroup, Cmd } from "./CommandGroup";
import { IconActionItem } from "@/commands/types";

export interface MainWindowProps extends ChildrenProp {
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
            <ListItem dense button disabled={item.disabled} key={item.id} onClick={item.handler}>
              <ListItemIcon>
                <Icon className="text-2xl" icon={item.icon} />
              </ListItemIcon>
              <ListItemText primary={item.label} disableTypography />
            </ListItem>
          ))}{" "}
        </div>{" "}
      </Typography>
    </Drawer>
  );
};
const ApplicationDrawer = memo(ApplicationDrawerInner);

const Alert: React.FC = () => {
  const dispatch = useDispatch();
  const alert = useSelector((state) => state.misc.alert);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AlertType>("info");
  const [message, setMessage] = useState("");
  const handleClose = useCallback(() => dispatch(HIDE_ALERT()), [dispatch]);
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
  return <RawAlert open={open} type={type} message={message} onClose={handleClose} />;
};

export const MainWindow: React.FC<MainWindowProps> = (props) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.misc.loading > 0);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpened(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpened(false);
  }, []);
  const config = useSelector((state) => state.persist.config);
  const onConfigChange = useCallback(
    (newConfig: Config) => {
      dispatch(UPDATE_CONFIG(newConfig));
    },
    [dispatch]
  );
  const preferenceDialogRef = useRef({} as ComponentRef<typeof PreferenceDialog>);
  const aboutDialogRef = useRef({} as ComponentRef<typeof AboutDialog>);
  const callbacks = useMemo(
    () => ({
      openPreference: () => preferenceDialogRef.current.open(),
      openAbout: () => aboutDialogRef.current.open()
    }),
    []
  );

  const drawerItems = useMemo<readonly IconActionItem[]>(
    () => [
      ...(props.drawerItems || []),
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
      if (loading) {
        e.preventDefault();
        return false;
      }
    },
    [loading]
  );
  return (
    <div
      className="absolute left-0 right-0 top-0 bottom-0 flex box-border m-0"
      onKeyDown={onKeyDown}
    >
      <CommandGroup name="main">
        <Cmd name="Preference" hotkey="Ctrl+Shift+P" handler={callbacks.openPreference} />
        <Cmd name="About" hotkey="Ctrl+Shift+V" handler={callbacks.openAbout} />
      </CommandGroup>
      <div className="absolute left-0 right-0 top-0 h-9 leading-9 pr-2 flex-row-nowrap bg-titlebar text-xl">
        <IconButton className="p-0 w-9" onClick={openDrawer} size="large">
          <Icon icon="mdi:menu" />
        </IconButton>
        <span className="flex-1">{props.title}</span>
        {props.titleBarActions &&
          props.titleBarActions.map((a) => (
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
        {props.children}
      </div>
      <PreferenceDialog ref={preferenceDialogRef} config={config} onConfigChange={onConfigChange} />
      <AboutDialog ref={aboutDialogRef} />
      <Loading open={loading} />
      <Alert />
    </div>
  );
};
