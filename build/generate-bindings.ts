import cp from "node:child_process";
import process from "node:process";

const main = () => {
  const cargo = cp.spawn("cargo", ["test"], {
    cwd: "src-tauri/types",
    stdio: ["ignore", "inherit", "pipe"]
  });
  const buffers: Buffer[] = [];
  cargo.stderr.on("data", (data) => {
    process.stderr.write(data);
    buffers.push(data);
  });
  cargo.on("exit", (code: number) => {
    const stderr = Buffer.concat(buffers).toString("utf-8");
    if (stderr.match(/failed to/)) {
      process.exit(-1);
    } else {
      process.exit(code);
    }
  });
};

main();
