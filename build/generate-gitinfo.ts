import process from "process";
import fs from "fs";
import cp from "child_process";

const main = () => {
  const ret = cp.spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: ".",
    stdio: ["pipe", "pipe", "inherit"]
  });
  const stdout = ret.stdout.toString("utf-8");
  if (ret.status !== 0) {
    return ret.status;
  }
  const data = {
    sha: stdout.replace("\n", "")
  };
  fs.writeFileSync("src/react/generated/gitinfo.json", JSON.stringify(data, null, 2));
  process.exit(0);
};

main();