import browserApi from "@/browserApi";
import { TabDefinition } from "@/components/TabContainer";
import { Grapher, GraphFragment } from "@/grapher";
import { throttle } from "lodash";
import { Dispatch, SetStateAction, useMemo } from "react";
import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil";

export type TabType = {
  commits: null;
  tree: {
    sha: string;
  };
  file: {
    sha: string;
    path: string;
  };
};

export type RepositoryTab = TabDefinition<TabType>;

const emptyRef: Refs = {
  heads: [],
  mergeHeads: [],
  remotes: {},
  tags: [],
  refsById: {}
};

export const repositoryPath$ = atom<string | undefined>({
  key: "repository/repositoryPath",
  default: undefined
});
export const refs$ = atom<Refs>({
  key: "repository/refs",
  default: emptyRef
});
export const commits$ = atom<Commit[]>({
  key: "repository/commits",
  default: []
});
export const graph$ = atom<Record<string, GraphFragment>>({
  key: "repository/graph",
  default: {}
});
export const tab$ = atom<{ tabs: RepositoryTab[]; currentIndex: number }>({
  key: "repository/tab",
  default: { tabs: [], currentIndex: -1 }
});
export const currentTabIndex$ = atom<number>({
  key: "repository/currentTabIndex",
  default: -1
});
export const logDetail$ = atom<LogDetail | undefined>({
  key: "repository/logDetail",
  default: undefined
});
export const currentLogIndex$ = atom({
  key: "repository/currentLogIndex",
  default: -1
});

export const currentRefs$ = selector({
  key: "repository/currentRefs",
  get: ({ get }) => {
    const commit = get(commits$)[get(currentLogIndex$)];
    if (!commit) {
      return [];
    }
    return get(refs$).refsById[commit.id] || [];
  }
});

export const useRepositoryAction = () => {
  const setRepositoryPath = useSetRecoilState(repositoryPath$);
  const setCommits = useSetRecoilState(commits$);
  const setRefs = useSetRecoilState(refs$);
  const setGraph = useSetRecoilState(graph$);
  const setTab = useSetRecoilState(tab$);
  return useMemo(
    () => ({
      open: async (repositoryPath: string) => {
        const { commits, refs } = await browserApi.openRepository(repositoryPath);
        const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
        const graph: Record<string, GraphFragment> = {};
        commits.forEach((c) => {
          graph[c.id] = grapher.proceed(c);
        });
        setRepositoryPath(repositoryPath);
        setCommits(commits);
        setRefs(refs);
        setGraph(graph);
        setTab({
          tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
          currentIndex: 0
        });
      },
      close: () => {
        setRepositoryPath(undefined);
        setCommits([]);
        setRefs(emptyRef);
        setGraph({});
        setTab({ tabs: [], currentIndex: -1 });
      }
    }),
    []
  );
};

const selectLogDebounce = throttle(
  async (
    repoPath: string,
    sha: string,
    setLogDetail: Dispatch<SetStateAction<LogDetail | undefined>>
  ) => {
    const logDetail = await browserApi.getLogDetail({ repoPath, sha });
    setLogDetail(logDetail);
  },
  300
);

export const useLogAction = () => {
  const repoPath = useRecoilValue(repositoryPath$);
  const commits = useRecoilValue(commits$);
  const setCurrentLogIndex = useSetRecoilState(currentLogIndex$);
  const setLogDetail = useSetRecoilState(logDetail$);
  return useMemo(
    () => ({
      selectLog: (index: number) => {
        if (!repoPath) {
          return;
        }
        setCurrentLogIndex(index);
        setLogDetail(undefined);
        selectLogDebounce(repoPath, commits[index].id, setLogDetail);
      }
    }),
    [repoPath, commits]
  );
};

export const useTabAction = () => {
  const setTab = useSetRecoilState(tab$);
  return useMemo(
    () => ({
      reset: (tabs: RepositoryTab[]) => {
        setTab({ tabs, currentIndex: tabs.length === 0 ? -1 : 0 });
      },
      select: (index: number) => {
        setTab((cur) => ({ tabs: cur.tabs, currentIndex: index }));
      },
      add: (tab: RepositoryTab) => {
        setTab((cur) => ({ tabs: [...cur.tabs, tab], currentIndex: cur.tabs.length }));
      },
      remove: (index: number) => {
        setTab((cur) => {
          const tabs = [...cur.tabs];
          tabs.splice(index, 1);
          let currentIndex = cur.currentIndex;
          if (tabs.length <= currentIndex) {
            currentIndex = tabs.length - 1;
          } else if (index < currentIndex) {
            currentIndex -= 1;
          }
          return { tabs, currentIndex };
        });
      }
    }),
    []
  );
};
