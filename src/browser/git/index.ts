import { catFile, saveTo, getTextFileContent } from "./file";
import { log, filelog, getCommitDetail } from "./log";
import { getRefs } from "./refs";
import { status, statusWithStat } from "./status";
import { blame } from "./blame";
import { lsTree } from "./lstree";

export default {
  catFile,
  saveTo,
  getTextFileContent,
  log,
  filelog,
  getCommitDetail,
  getRefs,
  status,
  statusWithStat,
  blame,
  lsTree
};
