import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import styled from "styled-components";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Drawer,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  withStyles
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import { PreferenceDialog } from "./PreferenceDialog";
import { AboutDialog } from "./AboutDialog";
import { useSelector } from "@/store";
import { useDispatch } from "@/store";
import { UPDATE_CONFIG } from "@/store/config";

const Container = styled.div`
  display: flex;
  margin: 0;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const TitleBar = styled.div`
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
  left: 0;
  top: 0;
  right: 0;
  height: 36px;
  line-height: 36px;
  background-color: #2a2a2a;
  font-size: 1.25rem;
`;

const TitleBarIconButton = withStyles({
  root: {
    padding: 0,
    width: 36
  }
})(IconButton);

const DrawerItemsWrapper = styled.div`
  width: 200px;
  padding-top: 20px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 0;
  right: 0;
  top: 36px;
  bottom: 0;
  box-sizing: border-box;
  padding: 4px;
`;

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
        <DrawerItemsWrapper onClick={close}>
          {items.map((item) => (
            <ListItem dense button key={item.key} onClick={item.onClick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} disableTypography />
            </ListItem>
          ))}
        </DrawerItemsWrapper>
      </Typography>
    </Drawer>
  );
});

export const MainWindow: React.FC<MainWindowProps> = (props) => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpened(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpened(false);
  }, []);
  const dispatch = useDispatch();
  const config = useSelector((state) => state.config);
  const onConfigChange = useCallback((config: Config) => dispatch(UPDATE_CONFIG(config)), []);
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
    <Container>
      <TitleBar>
        <TitleBarIconButton onClick={openDrawer}>
          <MenuIcon />
        </TitleBarIconButton>
        {props.title}
      </TitleBar>
      <ApplicationDrawer opened={drawerOpened} close={closeDrawer} items={drawerItems} />
      <Content>{props.children}</Content>
      <PreferenceDialog ref={preferenceDialogRef} config={config} onConfigChange={onConfigChange} />
      <AboutDialog ref={aboutDialogRef} />
    </Container>
  );
};
