import browserApi from "@/browserApi";
import { TabDefinition } from "@/components/TabContainer";
import { Grapher, GraphFragment } from "@/grapher";
import { useMemo } from "react";
import { atom, useSetRecoilState } from "recoil";

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
          if (!tabs[index].closable) {
            return cur;
          }
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
