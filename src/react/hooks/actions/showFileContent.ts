import { repoPathAtom } from "@/state/repository";
import { addTabAtom } from "@/state/repository/tabs";
import { getFileName, shortHash } from "@/util";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";

export const useShowFileContent = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addTabAtom);
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
