import { refs$, tab$, TabType, useTabAction } from "@/state/repository";
import { assertNever } from "@/util";
import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import { MainWindow } from "../MainWindow";
import TabContainer, { TabContainerProps } from "../TabContainer";
import BlameTab from "./BlameTab";
import CommitLog from "./CommitLog";

const RepositoryPage: React.VFC<{ path: string }> = (props) => {
  const refs = useRecoilValue(refs$);
  const tab = useRecoilValue(tab$);
  const tabAction = useTabAction();
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>((tab) => {
    switch (tab.type) {
      case "commits":
        return <CommitLog />;
      case "file":
        return <BlameTab {...tab.payload} refs={refs} />;
      case "tree":
        return <div>TEST</div>;
      default:
        assertNever(tab);
        break;
    }
  }, []);
  return (
    <MainWindow title={props.path}>
      <TabContainer
        tabs={tab.tabs}
        currentTabIndex={tab.currentIndex}
        renderTabContent={renderTabContent}
        selectTab={tabAction.select}
        closeTab={tabAction.remove}
      />
    </MainWindow>
  );
};

export default RepositoryPage;
