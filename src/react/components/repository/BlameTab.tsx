import browserApi from "@/browserApi";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import BlamePanel from "./BlamePanel";

export interface BlameTabProps {
  repoPath: string;
  path: string;
  sha: string;
  refs: Refs | undefined;
  fontSize: FontSize;
}

const BlameTab: React.VFC<BlameTabProps> = ({ repoPath, path, sha, refs, fontSize }) => {
  const [blame, setBlame] = useState<Blame | undefined>(undefined);
  useEffect(() => {
    if (!repoPath) {
      return;
    }
    setBlame(undefined);
    browserApi.getBlame({ repoPath, relPath: path, sha: sha }).then((blame) => {
      setBlame(blame);
    });
  }, [repoPath, path, sha]);

  return !blame ? (
    <Loading open />
  ) : (
    <BlamePanel
      persistKey="repository/BlameTab"
      blame={blame}
      path={path}
      sha={sha}
      refs={refs}
      fontSize={fontSize}
    />
  );
};

export default BlameTab;
