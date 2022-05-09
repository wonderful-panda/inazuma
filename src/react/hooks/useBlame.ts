import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useDispatch } from "@/store";
import { REPORT_ERROR } from "@/store/misc";
import { decodeBase64, decodeToString } from "@/strings";
import { useEffect, useState } from "react";

export const useBlame = (
  repoPath: string | undefined,
  relPath: string | undefined,
  revspec: string
) => {
  const [blame, setBlame] = useState<{ blame?: Blame; path: string } | undefined>(undefined);
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      setBlame(undefined);
      if (!repoPath || !relPath) {
        return;
      }
      setBlame({ path: relPath });
      try {
        const rawBlame = await invokeTauriCommand("get_blame", { repoPath, relPath, revspec });
        const content = decodeToString(decodeBase64(rawBlame.contentBase64));
        const commitIds: string[] = [];
        for (const entry of rawBlame.blameEntries) {
          for (const line of entry.lineNo) {
            commitIds[line - 1] = entry.id;
          }
        }
        setBlame({
          blame: {
            commits: rawBlame.commits,
            content,
            commitIds
          },
          path: relPath
        });
      } catch (error) {
        setBlame(undefined);
        dispatch(REPORT_ERROR({ error }));
      }
    })();
  }, [repoPath, relPath, revspec, dispatch]);
  return blame;
};