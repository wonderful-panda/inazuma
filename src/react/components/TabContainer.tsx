import { Icon } from "./Icon";
import classNames from "classnames";
import { Button, IconButton, makeStyles } from "@material-ui/core";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CURRENT_TABBUTTON_CLASS = "__current_tabbutton__";

const useStyles = makeStyles({
  autohideScrollbar: {
    "&::-webkit-scrollbar": {
      display: "none",
      height: "3px"
    },
    "&:hover::-webkit-scrollbar": {
      display: "block"
    }
  }
});

const TabButton: React.VFC<{
  text: string;
  closable: boolean;
  select: () => void;
  close: () => void;
  current: boolean;
}> = (p) => {
  return (
    <div
      className={classNames(
        "relative h-7 leading-7 border-r-2 border-solid border-background m-0",
        {
          ["text-primary bg-background " + CURRENT_TABBUTTON_CLASS]: p.current
        }
      )}
    >
      <Button
        classes={{
          root: classNames("normal-case m-0 p-0 h-7 leading-7", {
            "font-bold text-primary": p.current
          }),
          label: "mr-auto pl-2 pr-6 whitespace-nowrap font-mono text-lg"
        }}
        onClick={p.select}
      >
        {p.text}
      </Button>
      {p.closable && (
        <IconButton
          tabIndex={-1}
          className="absolute top-1 bottom-0 right-0 h-4 w-5 m-0 p-0 text-xs text-gray-500 hover:text-white"
          onClick={p.close}
        >
          <Icon className="text-xs" icon="mdi:close" />
        </IconButton>
      )}
    </div>
  );
};

export type TabProps<Type, Payload> = {
  type: Type;
  id: string;
  title: string;
  closable: boolean;
} & (Payload extends null ? {} : { payload: Payload });

export type TabDefinition<T> = {
  [K in keyof T]: TabProps<K, T[K]>;
}[keyof T];

export interface TabContainerProps<T> {
  tabs: readonly TabDefinition<T>[];
  currentTabIndex: number;
  renderTabContent: (tab: TabDefinition<T>, active: boolean) => React.ReactNode;
  selectTab: (index: number) => void;
  closeTab: (index: number) => void;
}

const TabPage = <T extends unknown>(p: {
  active: boolean;
  tab: TabDefinition<T>;
  renderContent: (tab: TabDefinition<T>, active: boolean) => React.ReactNode;
}) => {
  const [activated, setActivated] = useState(false);
  useLayoutEffect(() => {
    if (p.active && !activated) {
      setActivated(true);
    }
  }, [p.active, activated]);
  if (activated) {
    return <>{p.renderContent(p.tab, p.active)}</>;
  } else {
    return <></>;
  }
};

const TabContainer = <T extends unknown = Record<string, any>>(p: TabContainerProps<T>) => {
  const styles = useStyles();
  const tabBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tabBarRef.current?.querySelector(`.${CURRENT_TABBUTTON_CLASS}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [p.currentTabIndex]);

  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="flex-col-nowrap flex-1 items-stretch overflow-hidden p-0">
      <div
        className={classNames(
          "flex-row-nowrap overflow-x-auto overflow-y-hidden h-7 m-0 min-w-full",
          "bg-paper border-b border-solid border-background",
          styles.autohideScrollbar
        )}
        ref={tabBarRef}
      >
        {p.tabs.map((t, index) => (
          <TabButton
            key={t.id}
            text={t.title}
            closable={t.closable}
            select={() => p.selectTab(index)}
            close={() => p.closeTab(index)}
            current={index === p.currentTabIndex}
          />
        ))}
      </div>
      {p.tabs.map((t, index) => (
        <div
          className={classNames("flex flex-1 overflow-hidden", {
            hidden: index !== p.currentTabIndex
          })}
          key={t.id}
        >
          <TabPage
            active={index === p.currentTabIndex}
            tab={t}
            renderContent={p.renderTabContent}
          />
        </div>
      ))}
    </div>
  );
};

export default TabContainer;
