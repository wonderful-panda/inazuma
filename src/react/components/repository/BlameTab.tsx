import { dispatchBrowser } from "@/dispatchBrowser";
import { useEffect, useState } from "react";
import { Loading } from "../Loading";
import { BlamePanel } from "./BlamePanel";

export interface BlameTabProps {
  repoPath: string;
  path: string;
  commit: Commit;
  refs: Refs | undefined;
}

const BlameTab: React.VFC<BlameTabProps> = ({ repoPath, path, commit, refs }) => {
  const [blame, setBlame] = useState<Blame | undefined>(undefined);
  const sha = commit.id;
  useEffect(() => {
    if (!repoPath) {
      return;
    }
    setBlame(undefined);
    dispatchBrowser("getBlame", { repoPath, relPath: path, sha: sha }).then((blame) => {
      setBlame(blame);
    });
  }, [repoPath, path, sha]);

  return !blame ? (
    <Loading open />
  ) : (
    <BlamePanel persistKey="repository/BlameTab" blame={blame} path={path} sha={sha} refs={refs} />
  );
};

export default BlameTab;
