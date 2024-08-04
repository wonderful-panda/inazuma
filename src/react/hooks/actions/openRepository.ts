import { setLogAtom, logAtom, repoPathAtom, repositoryStoresAtomFamily } from "@/state/repository";
import { Getter, Setter } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { getFileName, toSlashedPath } from "@/util";
import { GraphFragment, Grapher } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { addRecentOpenedRepository } from "@/state/root";
import { addAppTab, getAppTabsValue, selectAppTab } from "@/state/tabs";
import { useAtomCallback } from "jotai/utils";
import { reflogAtom } from "@/state/repository/misc";

const fetchHistory = async (repoPath: string, reflogCount: number) => {
  const [[commits, rawRefs], user] = await Promise.all([
    invokeTauriCommand("fetch_history", {
      repoPath,
      maxCount: 1000,
      reflogCount
    }),
    invokeTauriCommand("get_user_info", { repoPath })
  ]);
  if (rawRefs.head) {
    commits.unshift({
      id: "--",
      author: user.name,
      mailAddress: user.email,
      date: Date.now(),
      summary: "<Working tree>",
      parentIds: [rawRefs.head, ...rawRefs.mergeHeads]
    });
  }
  const refs = makeRefs(rawRefs);
  const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"], refs);
  const graph: Record<string, GraphFragment> = {};
  commits.forEach((c) => {
    graph[c.id] = grapher.proceed(c);
  });
  return { commits, refs, graph };
};

const makeRefs = (rawRefs: RawRefs): Refs => {
  const { head, mergeHeads, refs: refArray } = rawRefs;
  const refs: Refs = {
    head: head || undefined,
    mergeHeads,
    branches: [],
    tags: [],
    remotes: {},
    refsById: {}
  };
  refArray.forEach((r) => {
    switch (r.type) {
      case "branch":
        refs.branches.push(r);
        break;
      case "tag":
        refs.tags.push(r);
        break;
      case "remote":
        (refs.remotes[r.remote] || (refs.remotes[r.remote] = [])).push(r);
        break;
      default:
        break;
    }
    (refs.refsById[r.id] || (refs.refsById[r.id] = [])).push(r);
  });
  const types: Ref["type"][] = ["branch", "tag", "remote", "reflog"];
  const compare = (a: Ref, b: Ref) => {
    if (a.type === b.type) {
      if (a.type === "branch" && b.type === "branch" && a.current !== b.current) {
        return a.current ? -1 : 1;
      } else if (a.type === "reflog" && b.type === "reflog") {
        return a.index - b.index;
      } else {
        return a.fullname.localeCompare(b.fullname);
      }
    } else {
      return types.indexOf(a.type) - types.indexOf(b.type);
    }
  };
  Object.values(refs.refsById).forEach((v) => v.sort(compare));
  return refs;
};

export const useOpenRepository = () => {
  return useAtomCallback(
    useCallbackWithErrorHandler(
      async (get: Getter, _set: Setter, realPath: string) => {
        const path = toSlashedPath(realPath);
        const store = get(repositoryStoresAtomFamily(path));
        const { commits, refs, graph } = await fetchHistory(path, 0);
        const appTabs = getAppTabsValue();
        const index = appTabs.tabs.findIndex(
          (tab) => tab.type === "repository" && path === tab.payload.path
        );
        if (0 <= index) {
          store.set(setLogAtom, { path, commits, refs, graph, keepTabs: true });
          selectAppTab(index);
          return;
        }
        await invokeTauriCommand("open_repository", { repoPath: path });
        addRecentOpenedRepository(path);
        store.set(setLogAtom, { path, commits, refs, graph, keepTabs: false });
        addAppTab({
          type: "repository",
          id: `__REPO__:${path}`,
          title: getFileName(path),
          payload: { path },
          closable: true
        });
      },
      [],
      { loading: true }
    )
  );
};

const reloadSpecifiedRepository = async (get: Getter, _set: Setter, path: string) => {
  const store = get(repositoryStoresAtomFamily(path));
  const reflogCount = store.get(reflogAtom) ? 26 : 0;
  const { commits, refs, graph } = await fetchHistory(path, reflogCount);
  store.set(setLogAtom, { path, commits, refs, graph, keepTabs: true });
};

export const useReloadSpecifiedRepository = () => {
  return useAtomCallback(
    useCallbackWithErrorHandler(reloadSpecifiedRepository, [], { loading: true })
  );
};

export const useReloadRepository = () => {
  return useAtomCallback(
    useCallbackWithErrorHandler(
      (get: Getter, set: Setter) => {
        const path = get(repoPathAtom);
        return reloadSpecifiedRepository(get, set, path);
      },
      [],
      { loading: true }
    )
  );
};

export const useLoadRepositoryIfNotYet = () => {
  return useAtomCallback(
    useCallbackWithErrorHandler(
      (get: Getter, set: Setter) => {
        if (get(logAtom) === undefined) {
          const path = get(repoPathAtom);
          return reloadSpecifiedRepository(get, set, path);
        }
      },
      [],
      { loading: true }
    )
  );
};
