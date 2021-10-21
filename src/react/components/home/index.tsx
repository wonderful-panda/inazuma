import { Divider, List, Typography } from "@material-ui/core";
import { RepositoryListItem } from "./RepositoryListItem";
import { useCallback, useEffect } from "react";
import { MainWindow } from "@/components/MainWindow";
import browserApi from "@/browserApi";
import { useDispatch, useSelector } from "@/store";
import { REMOVE_RECENT_OPENED_REPOSITORY } from "@/store/persist";
import { useCommandGroup } from "@/hooks/useCommandGroup";
import { HotKey } from "@/context/CommandGroupContext";
import openRepository from "@/store/thunk/openRepository";

export default () => {
  const commandGroup = useCommandGroup();
  const dispatch = useDispatch();
  const recentOpened = useSelector((state) => state.persist.env.recentOpenedRepositories);
  const handleOpen = useCallback((repoPath: string) => dispatch(openRepository(repoPath)), []);
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
  useEffect(() => {
    const groupName = "Home";
    commandGroup.register({
      groupName,
      commands: [
        { name: "OpenFolderBrowser", hotkey: "Ctrl+O", handler: handleBrowseClick },
        ...[1, 2, 3, 4, 5].map((i) => ({
          name: `OpenRecent-${i}`,
          hotkey: `Ctrl+Alt+${i}` as HotKey,
          handler: () => {
            const repoPath = recentOpened[i - 1];
            if (repoPath) {
              handleOpen(repoPath);
            }
          }
        }))
      ]
    });
    return () => {
      commandGroup.unregister(groupName);
    };
  }, [recentOpened, handleOpen]);

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
              icon="mdi:folder-search-outline"
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
                icon="mdi:history"
                action={handleOpen}
                secondaryAction={{
                  action: removeRecentOpenedRepository,
                  icon: "mdi:close"
                }}
              />
            ))}
          </List>
        </div>
      </div>
    </MainWindow>
  );
};
