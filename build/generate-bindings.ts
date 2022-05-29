import cp from "child_process";

const main = () => {
  const ret = cp.spawnSync("cargo", ["test"], {
    cwd: "src-tauri/types",
    stdio: ["ignore", "inherit", "pipe"]
  });
  if (ret.error) {
    throw ret.error;
  }
  const stderr = ret.stderr.toString("utf-8");
  if (stderr.match(/failed to parse serde attribute/)) {
    console.error(stderr);
    throw new Error("Failed to parse serde attribute");
  }
};

main();
