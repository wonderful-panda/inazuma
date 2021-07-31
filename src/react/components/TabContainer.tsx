import { vname } from "@/cssvar";
import { Button, IconButton, withStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useEffect, useRef } from "react";
import styled from "styled-components";

const TABBAR_HEIGHT = 24;
const CURRENT_TABBUTTON_CLASS = "__current_tabbutton__";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  overflow: hidden;
  padding: 0;
`;

const TabBar = styled.div`
  display: flex;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  flex-flow: row nowrap;
  height: ${TABBAR_HEIGHT}px;
  background-color: var(${vname("backgroundPaper")});
  &::-webkit-scrollbar {
    display: none;
    height: 3px;
  }
  &:hover::-webkit-scrollbar {
    display: block;
  }
`;

const TabButtonDiv = styled.div`
  display: inline-block;
  position: relative;
  height: ${TABBAR_HEIGHT}px;
  line-height: ${TABBAR_HEIGHT}px;
  border-right: 1px solid #111;
  margin: 0;
  &.${CURRENT_TABBUTTON_CLASS} {
    color: var(${vname("primary")});
    font-weight: bold;
    background-color: var(${vname("backgroundDefault")});
  }
`;

const TabTextButton = withStyles({
  root: {
    textTransform: "none",
    fontWeight: "inherit",
    color: "inherit",
    margin: 0,
    padding: 0,
    height: TABBAR_HEIGHT
  },
  label: {
    marginRight: "auto",
    paddingLeft: 8,
    paddingRight: 20,
    whiteSpace: "nowrap"
  }
})(Button);

const CloseIconButton = withStyles({
  root: {
    position: "absolute",
    top: 1,
    right: 0,
    margin: 0,
    padding: 0,
    height: 20,
    width: 20,
    fontSize: "small",
    color: "gray",
    "&:hover": {
      color: "white"
    }
  }
})(IconButton);

const TabButton: React.VFC<{
  text: string;
  closable: boolean;
  select: () => void;
  close: () => void;
  className?: string;
}> = (p) => {
  return (
    <TabButtonDiv className={p.className}>
      <TabTextButton onClick={p.select}>{p.text}</TabTextButton>
      {p.closable && (
        <CloseIconButton onClick={p.close}>
          <CloseIcon fontSize="inherit" />
        </CloseIconButton>
      )}
    </TabButtonDiv>
  );
};

const TabContent = styled.div<{ current: boolean }>`
  display: flex;
  flex: 1;
  display: ${(p) => (p.current ? undefined : "none")};
`;

export type TabProps<Type, Payload> = {
  type: Type;
  id: string;
  title: string;
  closable: boolean;
  payload: Payload;
};

export type TabDefinition<T> = {
  [K in keyof T]: TabProps<K, T[K]>;
}[keyof T];

export interface TabContainerProps<T> {
  tabs: readonly TabDefinition<T>[];
  currentTabIndex: number;
  renderTabContent: (tab: TabDefinition<T>) => React.ReactNode;
  selectTab: (index: number) => void;
  closeTab: (index: number) => void;
}

const TabContainer = <T extends unknown = Record<string, any>>(p: TabContainerProps<T>) => {
  const tabBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tabBarRef.current?.querySelector(`.${CURRENT_TABBUTTON_CLASS}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [p.currentTabIndex]);
  return (
    <Container>
      <TabBar ref={tabBarRef}>
        {p.tabs.map((t, index) => (
          <TabButton
            key={t.id}
            text={t.title}
            closable={t.closable}
            select={() => p.selectTab(index)}
            close={() => p.closeTab(index)}
            className={index === p.currentTabIndex ? CURRENT_TABBUTTON_CLASS : undefined}
          />
        ))}
      </TabBar>
      {p.tabs.map((t, index) => (
        <TabContent key={t.id} current={index === p.currentTabIndex}>
          {p.renderTabContent(t)}
        </TabContent>
      ))}
    </Container>
  );
};

export default TabContainer;
