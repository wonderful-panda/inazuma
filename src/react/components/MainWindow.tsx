import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Drawer, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import { PreferenceDialog } from "./PreferenceDialog";
import { AboutDialog } from "./AboutDialog";
import Loading from "./Loading";
import { useDispatch, useSelector } from "@/store";
import { UPDATE_CONFIG } from "@/store/persist";

export interface DrawerItem {
  key: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface MainWindowProps {
  title: string;
  drawerItems?: readonly DrawerItem[];
}

const ApplicationDrawer = memo<{
  opened: boolean;
  close: () => void;
  items: readonly DrawerItem[];
}>(({ opened, close, items }) => {
  return (
    <Drawer anchor="left" open={opened} onClose={close}>
      <Typography variant="h6" component="div">
        <div className="w-52 pt-5" onClick={close}>
          {items.map((item) => (
            <ListItem dense button key={item.key} onClick={item.onClick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} disableTypography />
            </ListItem>
          ))}{" "}
        </div>{" "}
      </Typography>
    </Drawer>
  );
});

export const MainWindow: React.FC<MainWindowProps> = (props) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.misc.loading);
  const [drawerOpened, setDrawerOpened] = useState(false);
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

  const drawerItems = useMemo<readonly DrawerItem[]>(
    () => [
      ...(props.drawerItems || []),
      {
        key: "preference",
        text: "Preference",
        icon: <SettingsIcon />,
        onClick: () => {
          preferenceDialogRef.current.open();
        }
      },
      {
        key: "about",
        text: "About",
        icon: <InfoIcon />,
        onClick: () => {
          aboutDialogRef.current.open();
        }
      }
    ],
    [props.drawerItems]
  );
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex box-border m-0">
      <div className="absolute left-0 right-0 top-0 h-9 leading-9 flex-row-nowrap bg-titlebar text-xl">
        <IconButton className="p-0 w-9" onClick={openDrawer}>
          <MenuIcon />
        </IconButton>
        {props.title}
      </div>
      <ApplicationDrawer opened={drawerOpened} close={closeDrawer} items={drawerItems} />
      <div className="absolute left-0 right-0 top-9 bottom-0 flex box-border p-1">
        {props.children}
      </div>
      <PreferenceDialog ref={preferenceDialogRef} config={config} onConfigChange={onConfigChange} />
      <AboutDialog ref={aboutDialogRef} />
      <Loading open={loading} />
    </div>
  );
};
