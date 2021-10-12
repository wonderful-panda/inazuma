import { useDispatch, useSelector } from "@/store";
import { REMOVE_TAB, SELECT_TAB, TabType } from "@/store/repository";
import { assertNever } from "@/util";
import { useCallback } from "react";
import { MainWindow } from "../MainWindow";
import TabContainer, { TabContainerProps } from "../TabContainer";
import BlameTab from "./BlameTab";
import CommitLog from "./CommitLog";

const RepositoryPage: React.VFC = () => {
  const dispatch = useDispatch();
  const repoPath = useSelector((state) => state.repository.path);
  const refs = useSelector((state) => state.repository.log?.refs);
  const tab = useSelector((state) => state.repository.tab);
  if (!repoPath || !tab) {
    return <></>;
  }
  const renderTabContent = useCallback<TabContainerProps<TabType>["renderTabContent"]>((tab) => {
    switch (tab.type) {
      case "commits":
        return <CommitLog />;
      case "file":
        return <BlameTab repoPath={repoPath} {...tab.payload} refs={refs} />;
      case "tree":
        return <div>TEST</div>;
      default:
        assertNever(tab);
        break;
    }
  }, []);

  const selectTab = useCallback((index: number) => dispatch(SELECT_TAB(index)), []);
  const closeTab = useCallback((index: number) => dispatch(REMOVE_TAB(index)), []);
  return (
    <MainWindow title={repoPath}>
      <TabContainer
        tabs={tab.tabs}
        currentTabIndex={tab.currentIndex}
        renderTabContent={renderTabContent}
        selectTab={selectTab}
        closeTab={closeTab}
      />
    </MainWindow>
  );
};

export default RepositoryPage;
