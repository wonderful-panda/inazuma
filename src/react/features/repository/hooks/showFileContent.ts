import { useAtomValue, useSetAtom } from "jotai";
import { repoPathAtom } from "@/features/repository/state";
import { addRepoTabAtom } from "@/features/repository/state/tabs";
import { getFileName, shortHash } from "@/util";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

export const useShowFileContent = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addRepoTabAtom);
  return useCallbackWithErrorHandler(
    (commit: Commit, file: FileEntry) => {
      if (!repoPath) {
        return;
      }
      if (file.statusCode === "D") {
        return;
      }
      addTab({
        type: "file",
        id: `blame:${commit.id}/${file.path}`,
        title: `${getFileName(file.path)} @ ${shortHash(commit.id)}`,
        payload: { path: file.path, commit },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};
