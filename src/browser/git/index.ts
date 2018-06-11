import { catFile, saveTo } from "./file";
import { log, filelog, getCommitDetail } from "./log";
import { getRefs } from "./refs";
import { status } from "./status";
import { blame } from "./blame";
import { lsTree } from "./lstree";

export default {
  catFile,
  saveTo,
  log,
  filelog,
  getCommitDetail,
  getRefs,
  status,
  blame,
  lsTree
};
