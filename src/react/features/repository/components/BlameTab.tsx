import { BlamePanel } from "./BlamePanel";
import { RepositoryErrorBoundary } from "./RepositoryErrorBoundary";

export interface BlameTabProps {
  repoPath: string;
  path: string;
  commit: Commit;
  refs: Refs | undefined;
}

const BlameTab: React.FC<BlameTabProps> = ({ repoPath, path, commit, refs }) => {
  return (
    <RepositoryErrorBoundary>
      <BlamePanel
        persistKey="repository/BlameTab"
        repoPath={repoPath}
        path={path}
        commit={commit}
        refs={refs}
        showCommitAttrs
      />
    </RepositoryErrorBoundary>
  );
};

export default BlameTab;
