import { Loading } from "../Loading";
import { BlamePanel } from "./BlamePanel";
import { useBlame } from "@/hooks/useBlame";

export interface BlameTabProps {
  repoPath: string;
  path: string;
  commit: Commit;
  refs: Refs | undefined;
}

const BlameTab: React.FC<BlameTabProps> = ({ repoPath, path, commit, refs }) => {
  const blame = useBlame(repoPath, path, commit.id);
  return blame?.blame ? (
    <BlamePanel
      persistKey="repository/BlameTab"
      blame={blame.blame}
      path={path}
      commit={commit}
      refs={refs}
      showCommitAttrs
    />
  ) : (
    <Loading open />
  );
};

export default BlameTab;
