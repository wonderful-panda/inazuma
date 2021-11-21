import { Divider, List, Typography } from "@material-ui/core";
import { RepositoryListItem } from "./RepositoryListItem";
import { useCallback, useMemo } from "react";
import { MainWindow } from "@/components/MainWindow";
import { useDispatch, useSelector } from "@/store";
import { REMOVE_RECENT_OPENED_REPOSITORY } from "@/store/persist";
import { OPEN_REPOSITORY } from "@/store/thunk/openRepository";
import { CommandGroup, Cmd } from "../CommandGroup";
import { Command } from "@/context/CommandGroupContext";
import { dispatchBrowser } from "@/dispatchBrowser";

const Home = () => {
  const dispatch = useDispatch();
  const recentOpened = useSelector((state) => state.persist.env.recentOpenedRepositories);
  const handleOpen = useCallback(
    (repoPath: string | undefined) => repoPath && dispatch(OPEN_REPOSITORY(repoPath)),
    [dispatch]
  );
  const handleBrowseClick = useCallback(async () => {
    const options: Electron.OpenDialogOptions = {
      properties: ["openDirectory"]
    };
    const ret = await dispatchBrowser("showOpenDialog", options);
    if (!ret.canceled) {
      handleOpen(ret.filePaths[0]);
    }
  }, [handleOpen]);

  const removeRecentOpenedRepository = useCallback(
    (path) => dispatch(REMOVE_RECENT_OPENED_REPOSITORY(path)),
    [dispatch]
  );
  const openRecents = useMemo<Command[]>(
    () =>
      ([1, 2, 3, 4, 5] as const).map((i) => ({
        name: `OpenRecent-${i}`,
        hotkey: `Ctrl+Alt+${i}`,
        handler: () => handleOpen(recentOpened[i - 1])
      })),
    [recentOpened, handleOpen]
  );
  return (
    <MainWindow title="Inazuma">
      <CommandGroup name="home">
        <Cmd name="OpenFolderSelector" hotkey="Ctrl+O" handler={handleBrowseClick} />
        {openRecents.map((command) => (
          <Cmd key={command.name} {...command} />
        ))}
      </CommandGroup>
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
                primary={path.split(/[\\/]/).pop() || path}
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

export default Home;
