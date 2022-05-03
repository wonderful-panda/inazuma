/* eslint-disable */
export * from "../generated/tauri-types";
import {
  Config,
  Environment,
  Commit,
  Ref,
  Refs,
  WorkingTreeStat,
  Blame,
  LstreeEntry
} from "../generated/tauri-types";

export type BranchRef = Extract<Ref, { type: "branch" }>;
export type TagRef = Extract<Ref, { type: "tag" }>;
export type RemoteRef = Extract<Ref, { type: "remote" }>;

export type TauriCommands = {
  commit: [{ repoPath: string; options: CommitOptions }, void];
  fetch_history: [{ repoPath: string; maxCount: number }, [Commit[], Refs]];
  get_blame: [{ repoPath: string; relPath: string; revspec: string }, Blame];
  get_changes_between: [{ repoPath: string; revspec1: string; revspec2: string }, FileEntry[]];
  get_commit_detail: [{ repoPath: string; revspec: string }, CommitDetail];
  get_content_base64: [{ repoPath: string; relPath: string; revspec: string }, string];
  get_tree: [{ repoPath: string; revspec: string }, LstreeEntry[]];
  get_workingtree_stat: [{ repoPath: string }, WorkingTreeStat];
  get_workingtree_udiff_base64: [{ repoPath: string; relPath: string; cached: boolean }, string];
  load_persist_data: [never, [Config, Environment]];
  save_config: [{ newConfig: Config }, void];
  show_folder_selector: [never, string];
  stage: [{ repoPath: string; relPath: string }, void];
  store_recent_opened: [{ newList: string[] }, void];
  store_state: [{ newState: Record<string, string> }, void];
  unstage: [{ repoPath: string; relPath: string }, void];
  show_external_diff: [{ repoPath: string; left: FileSpec; right: FileSpec }, void];
  yank_text: [{ text: string }, void];
  open_pty: [{ commandLine: string; cwd: string; rows: number; cols: number }, number];
  write_pty: [{ id: number; data: string }];
  resize_pty: [{ id: number; rows: number; cols: number }];
  close_pty: [{ id: number }];
  find_repository_root: [never, string];
};

export type TauriInvokeArgs<P> = P extends never ? [] : [P];

export type TauriInvoke = <K extends keyof TauriCommands>(
  command: K,
  ...args: TauriInvokeArgs<TauriCommands[K][0]>
) => Promise<TauriCommands[K][1]>;
