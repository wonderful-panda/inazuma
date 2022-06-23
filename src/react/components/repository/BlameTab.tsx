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
  const sha = commit.id;
  const blame = useBlame(repoPath, path, sha);
  return blame?.blame ? (
    <BlamePanel
      persistKey="repository/BlameTab"
      blame={blame.blame}
      path={path}
      sha={sha}
      refs={refs}
    />
  ) : (
    <Loading open />
  );
};

export default BlameTab;
