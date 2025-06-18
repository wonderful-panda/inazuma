import process from "node:process";
import fs from "node:fs";
import cp from "node:child_process";
import path from "node:path";

const main = () => {
  console.log("Generating license information...");

  // Generate Rust licenses using cargo-about
  console.log("Generating Rust licenses...");
  const cargoRet = cp.spawnSync("cargo", ["about", "generate", "about.hbs", "--output-file", "../src/react/generated/rust-licenses.html"], {
    cwd: "./src-tauri",
    stdio: ["pipe", "pipe", "inherit"]
  });

  if (cargoRet.status !== 0) {
    console.error("Failed to generate Rust licenses");
    return cargoRet.status;
  }

  // Check if file was created
  const rustLicensePath = path.join("src", "react", "generated", "rust-licenses.html");
  if (fs.existsSync(rustLicensePath)) {
    console.log("Rust licenses written to rust-licenses.html");
  } else {
    console.log("No Rust license file was generated");
  }

  // Generate JavaScript licenses using license-checker
  console.log("Generating JavaScript licenses...");
  const jsRet = cp.spawnSync("license-checker", ["--json", "--excludePrivatePackages", "--production"], {
    cwd: ".",
    stdio: ["pipe", "pipe", "inherit"],
    shell: true
  });

  if (jsRet.status !== 0) {
    console.error("Failed to generate JavaScript licenses");
    return jsRet.status;
  }

  const jsLicenses = jsRet.stdout.toString("utf-8");
  if (jsLicenses.trim()) {
    fs.writeFileSync(path.join("src", "react", "generated", "js-licenses.json"), jsLicenses);
    console.log("JavaScript licenses written to js-licenses.json");
  } else {
    console.log("No JavaScript license content generated");
  }

  console.log("License generation completed successfully!");
  process.exit(0);
};

main();
