import { FileCommand } from "./types";

export const fileCommandBlame: FileCommand = {
  id: "Blame",
  label: "View(blame) this version",
  isVisible(_, file) {
    return file.statusCode != "D";
  },
  handler(store, commit, file) {
    store.actions.showFileTab(commit.id, file.path);
  }
};

export const fileCommandBlameParent: FileCommand = {
  id: "BlameParent",
  label: "View(blame) previous version",
  isVisible(commit, file) {
    return commit.parentIds.length > 0 && file.statusCode != "A";
  },
  handler(store, commit, file) {
    store.actions.showFileTab(commit.parentIds[0], file.oldPath || file.path);
  }
};
