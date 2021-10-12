import { Divider, List, Typography } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import HistoryIcon from "@material-ui/icons/History";
import CloseIcon from "@material-ui/icons/Close";
import { RepositoryListItem } from "./RepositoryListItem";
import { useCallback } from "react";
import { MainWindow } from "@/components/MainWindow";
import { useErrorReporter } from "@/hooks/useAlert";
import browserApi from "@/browserApi";
import { useDispatch, useSelector } from "@/store";
import { ADD_RECENT_OPENED_REPOSITORY, REMOVE_RECENT_OPENED_REPOSITORY } from "@/store/persist";
import { OPEN_REPOSITORY } from "@/store/repository";
import { HIDE_LOADING, SHOW_LOADING } from "@/store/misc";

export default () => {
  const dispatch = useDispatch();
  const errorReporter = useErrorReporter();
  const recentOpened = useSelector((state) => state.persist.env.recentOpenedRepositories);
  const handleOpen = useCallback(
    async (repoPath: string) => {
      try {
        dispatch(SHOW_LOADING());
        await dispatch(OPEN_REPOSITORY({ path: repoPath }));
        dispatch(ADD_RECENT_OPENED_REPOSITORY(repoPath));
      } catch (e) {
        errorReporter(e);
      } finally {
        dispatch(HIDE_LOADING());
      }
    },
    [errorReporter]
  );
  const handleBrowseClick = useCallback(async () => {
    const options: Electron.OpenDialogOptions = {
      properties: ["openDirectory"]
    };
    const ret = await browserApi.showOpenDialog(options);
    if (!ret.canceled) {
      handleOpen(ret.filePaths[0]);
    }
  }, [handleOpen]);

  const removeRecentOpenedRepository = useCallback(
    (path) => dispatch(REMOVE_RECENT_OPENED_REPOSITORY(path)),
    []
  );

  return (
    <MainWindow title="Inazuma">
      <div className="flex-col-nowrap flex-1 flex-nowrap max-w-2xl p-4">
        <h2 className="text-2xl my-2 font-bold">SELECT REPOSITORY</h2>
        <div className="flex flex-1 flex-col flex-nowrap pl-4">
          <List dense>
            <RepositoryListItem
              itemId="__browse__"
              key="__browse__"
              primary="BROWSE..."
              secondary="Select repository by folder browser"
              icon={<SearchIcon />}
              action={handleBrowseClick}
            />
          </List>
          <Divider className="mb-2" />
          <Typography variant="h6" color="primary">
            Recent Opened
          </Typography>
          <List dense>
            {recentOpened.map((path) => (
              <RepositoryListItem
                key={path}
                itemId={path}
                primary={path.split(/[\\\/]/).pop() || path}
                secondary={<span className="font-mono">{path}</span>}
                icon={<HistoryIcon />}
                action={handleOpen}
                secondaryAction={{
                  action: removeRecentOpenedRepository,
                  icon: <CloseIcon />
                }}
              />
            ))}
          </List>
        </div>
      </div>
    </MainWindow>
  );
};
