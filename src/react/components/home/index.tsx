import { Divider, List, Typography } from "@mui/material";
import { RepositoryListItem, RepositoryListItemProps } from "./RepositoryListItem";
import { useCallback, useMemo } from "react";
import { MainWindow } from "@/components/MainWindow";
import { CommandGroup, Cmd } from "../CommandGroup";
import { Command } from "@/context/CommandGroupContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import {
  useRemoveRecentOpenedRepository,
  useVisibleRecentOpenedRepositoriesValue
} from "@/state/root";
import { useOpenRepository } from "@/hooks/actions/openRepository";

const Home = () => {
  const openRepository = useOpenRepository();
  const recentOpenedRepositories = useVisibleRecentOpenedRepositoriesValue();
  const removeRecentOpenedRepository = useRemoveRecentOpenedRepository();
  const handleOpen = useCallback(
    (repoPath: string | undefined) => repoPath && openRepository(repoPath),
    [openRepository]
  );
  const removeItemAction = useMemo<RepositoryListItemProps["secondaryAction"]>(
    () => ({
      action: removeRecentOpenedRepository,
      icon: "mdi:close"
    }),
    [removeRecentOpenedRepository]
  );
  const handleBrowseClick = useCallback(async () => {
    const ret = await invokeTauriCommand("show_folder_selector");
    if (ret) {
      handleOpen(ret);
    }
  }, [handleOpen]);

  const openRecents = useMemo<Command[]>(
    () =>
      ([1, 2, 3, 4, 5] as const).map((i) => ({
        name: `OpenRecent-${i}`,
        hotkey: `Ctrl+Alt+${i}`,
        handler: () => handleOpen(recentOpenedRepositories[i - 1])
      })),
    [recentOpenedRepositories, handleOpen]
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
            {recentOpenedRepositories.map((path) => (
              <RepositoryListItem
                key={path}
                itemId={path}
                primary={path.split(/[\\/]/).pop() || path}
                secondary={<span className="font-mono">{path}</span>}
                icon="mdi:history"
                action={handleOpen}
                secondaryAction={removeItemAction}
              />
            ))}
          </List>
        </div>
      </div>
    </MainWindow>
  );
};

export default Home;
