import styled from "styled-components";
import { Divider, List, Typography, withStyles } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import HistoryIcon from "@material-ui/icons/History";
import CloseIcon from "@material-ui/icons/Close";
import { RepositoryListItem } from "./RepositoryListItem";
import { useCallback, useMemo, useState } from "react";
import { MainWindow } from "@/components/MainWindow";
import { useDispatch, useSelector } from "@/store";
import useBrowserProcess from "@/hooks/useBrowserProcess";
import { openRepository, REMOVE_RECENT_OPENED_ENTRIES } from "@/store/repository";
import { useErrorReporter } from "@/hooks/useAlert";
import Loading from "../Loading";

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  max-width: 600px;
  padding: 0.5rem 1rem;
`;

const StyledDivider = withStyles({
  root: {
    margin: "0 0 0.5rem 0"
  }
})(Divider);

export default () => {
  const [loading, setLoading] = useState(false);
  const errorReporter = useErrorReporter();
  const dispatch = useDispatch();
  const _recentOpened = useSelector((state) => state.repository.recentOpened);
  const recentListCount = useSelector((state) => state.config.recentListCount);
  const recentOpened = useMemo(() => {
    return _recentOpened.slice(0, recentListCount);
  }, [_recentOpened, recentListCount]);
  const handleOpen = useCallback(
    (repoPath: string) => dispatch(openRepository({ repoPath, errorReporter, setLoading })),
    [errorReporter, setLoading]
  );
  const handleBrowseClick = useCallback(async () => {
    const options: Electron.OpenDialogOptions = {
      properties: ["openDirectory"]
    };
    const browserProcess = useBrowserProcess();
    const ret = await browserProcess.showOpenDialog(options);
    if (!ret.canceled) {
      handleOpen(ret.filePaths[0]);
    }
  }, [handleOpen]);
  const handleRemove = useCallback((path: string) => {
    dispatch(REMOVE_RECENT_OPENED_ENTRIES(path));
  }, []);

  return (
    <MainWindow title="Inazuma">
      <Wrapper>
        <h2>SELECT REPOSITORY</h2>
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
        <StyledDivider />
        <Typography variant="body1" color="primary">
          Recent Opened
        </Typography>
        <List dense>
          {recentOpened.map((path) => (
            <RepositoryListItem
              key={path}
              itemId={path}
              primary={path.split("/").pop() || path}
              secondary={path}
              icon={<HistoryIcon />}
              action={handleOpen}
              secondaryAction={{
                action: handleRemove,
                icon: <CloseIcon />
              }}
            />
          ))}
        </List>
      </Wrapper>
      <Loading open={loading} />
    </MainWindow>
  );
};
