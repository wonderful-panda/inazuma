import { BlamePanel } from "./BlamePanel";

export interface BlameTabProps {
  repoPath: string;
  path: string;
  commit: Commit;
  refs: Refs | undefined;
}

const BlameTab: React.FC<BlameTabProps> = ({ repoPath, path, commit, refs }) => {
  return (
    <BlamePanel
      persistKey="repository/BlameTab"
      repoPath={repoPath}
      path={path}
      commit={commit}
      refs={refs}
      showCommitAttrs
    />
  );
};

export default BlameTab;
