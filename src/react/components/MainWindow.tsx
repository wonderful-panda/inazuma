import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import { PreferenceDialog } from "./PreferenceDialog";
import { AboutDialog } from "./AboutDialog";
import Loading from "./Loading";
import { useDispatch, useSelector } from "@/store";
import { UPDATE_CONFIG } from "@/store/persist";
import { useCommandGroup } from "@/hooks/useCommandGroup";
import Alert_ from "./Alert";
import { HIDE_ALERT } from "@/store/misc";

export interface ActionItem {
  key: string;
  text: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export interface MainWindowProps {
  title: string;
  drawerItems?: readonly ActionItem[];
  titleBarActions?: readonly ActionItem[];
}

const ApplicationDrawer = memo<{
  opened: boolean;
  close: () => void;
  items: readonly ActionItem[];
}>(({ opened, close, items }) => {
  return (
    <Drawer anchor="left" open={opened} onClose={close}>
      <Typography variant="h6" component="div">
        <div className="w-52 pt-5" onClick={close}>
          {items.map((item) => (
            <ListItem dense button disabled={item.disabled} key={item.key} onClick={item.onClick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} disableTypography />
            </ListItem>
          ))}{" "}
        </div>{" "}
      </Typography>
    </Drawer>
  );
});

const Alert: React.VFC = () => {
  const dispatch = useDispatch();
  const alert = useSelector((state) => state.misc.alert);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AlertType>("info");
  const [message, setMessage] = useState("");
  const handleClose = useCallback(() => dispatch(HIDE_ALERT()), []);
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
  return <Alert_ open={open} type={type} message={message} onClose={handleClose} />;
};

export const MainWindow: React.FC<MainWindowProps> = (props) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.misc.loading);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const commandGroup = useCommandGroup();
  useEffect(() => {
    const groupName = "main";
    commandGroup.register({
      groupName,
      commands: [
        {
          name: "Preference",
          hotkey: "Ctrl+Shift+P",
          handler: preferenceDialogRef.current.open
        },
        {
          name: "About",
          hotkey: "Ctrl+Shift+V",
          handler: aboutDialogRef.current.open
        }
      ]
    });
    return () => {
      commandGroup.unregister(groupName);
    };
  }, []);
  const openDrawer = useCallback(() => {
    setDrawerOpened(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpened(false);
  }, []);
  const config = useSelector((state) => state.persist.config);
  const onConfigChange = useCallback((newConfig: Config) => {
    dispatch(UPDATE_CONFIG(newConfig));
  }, []);
  const preferenceDialogRef = useRef({} as ComponentRef<typeof PreferenceDialog>);
  const aboutDialogRef = useRef({} as ComponentRef<typeof AboutDialog>);

  const drawerItems = useMemo<readonly ActionItem[]>(
    () => [
      ...(props.drawerItems || []),
      {
        key: "preference",
        text: "Preference",
        icon: <SettingsIcon />,
        onClick: () => preferenceDialogRef.current.open()
      },
      {
        key: "about",
        text: "About",
        icon: <InfoIcon />,
        onClick: () => aboutDialogRef.current.open()
      }
    ],
    [props.drawerItems]
  );
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex box-border m-0">
      <div className="absolute left-0 right-0 top-0 h-9 leading-9 pr-2 flex-row-nowrap bg-titlebar text-xl">
        <IconButton className="p-0 w-9" onClick={openDrawer}>
          <MenuIcon />
        </IconButton>
        <span className="flex-1">{props.title}</span>
        {props.titleBarActions &&
          props.titleBarActions.map((a) => (
            <IconButton
              key={a.key}
              title={a.text}
              disabled={a.disabled}
              className="p-0 w-9"
              onClick={a.onClick}
            >
              {a.icon}
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
