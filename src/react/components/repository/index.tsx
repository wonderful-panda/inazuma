import { useDispatch, useSelector } from "@/store";
import { REMOVE_TAB, SELECT_TAB, TabType } from "@/store/repository";
import { assertNever } from "@/util";
import { useCallback } from "react";
import { MainWindow } from "../MainWindow";
import TabContainer, { TabContainerProps } from "../TabContainer";
import CommitLog from "./CommitLog";
import Test from "./Test";

const RepositoryPage: React.VFC<{ path: string }> = (props) => {
  const repos = useSelector((state) => state.repository);
  const dispatch = useDispatch();
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>((tab) => {
    switch (tab.type) {
      case "commits":
        return <CommitLog />;
      case "file":
        return <Test tab={tab} />;
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
        tabs={repos.tabs}
        currentTabIndex={repos.currentTabIndex}
        renderTabContent={renderTabContent}
        selectTab={(index) => dispatch(SELECT_TAB(index))}
        closeTab={(index) => dispatch(REMOVE_TAB(index))}
      />
    </MainWindow>
  );
};

export default RepositoryPage;
