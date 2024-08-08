import { createDialogAtoms } from "../dialog";

export type RepositoryDialogParam =
  | { type: "Commit" }
  | { type: "NewBranch"; commitId: string }
  | { type: "DeleteBranch"; branchName: string };

export const { activeDialogAtom, openDialogAtom, closeDialogAtom, resetDialogAtom } =
  createDialogAtoms<RepositoryDialogParam>();
