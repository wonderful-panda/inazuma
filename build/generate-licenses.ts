import process from "node:process";
import fs from "node:fs";
import cp from "node:child_process";
import path from "node:path";
import Handlebars from "handlebars";

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

    // Generate HTML from JSON licenses
    console.log("Generating JavaScript licenses HTML...");
    generateJsLicensesHtml(JSON.parse(jsLicenses));
  } else {
    console.log("No JavaScript license content generated");
  }

  console.log("License generation completed successfully!");
  process.exit(0);
};

const generateJsLicensesHtml = (licensesData: Record<string, any>) => {
  // Group licenses by license type
  const licenseGroups: Record<string, Array<{name: string, version: string, repository?: string, licenseFile?: string, publisher?: string}>> = {};
  const licenseTexts: Record<string, string> = {};

  for (const [packageName, data] of Object.entries(licensesData)) {
    const licenseName = data.licenses || 'Unknown';
    const [name, version] = packageName.split('@').slice(-2);

    if (!licenseGroups[licenseName]) {
      licenseGroups[licenseName] = [];
    }

    licenseGroups[licenseName].push({
      name: name || packageName,
      version: version || '',
      repository: data.repository || `https://www.npmjs.com/package/${name || packageName}`,
      licenseFile: data.licenseFile,
      publisher: data.publisher
    });

    // Store license text if available
    if (data.licenseFile && fs.existsSync(data.licenseFile)) {
      try {
        licenseTexts[licenseName] = fs.readFileSync(data.licenseFile, 'utf-8');
      } catch (e) {
        // Ignore file read errors
      }
    }
  }

  // Prepare data for Handlebars template
  const templateData = {
    overview: Object.entries(licenseGroups).map(([licenseName, packages]) => ({
      id: licenseName.replace(/[^a-zA-Z0-9]/g, '-'),
      name: licenseName,
      count: packages.length
    })),
    licenses: Object.entries(licenseGroups).map(([licenseName, packages]) => ({
      id: licenseName.replace(/[^a-zA-Z0-9]/g, '-'),
      name: licenseName,
      used_by: packages,
      text: licenseTexts[licenseName] || 'License text not available'
    }))
  };

  // Read and compile Handlebars template
  const templatePath = path.join("build", "js-licenses.hbs");
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  // Generate HTML
  const html = template(templateData);

  fs.writeFileSync(path.join("src", "react", "generated", "js-licenses.html"), html);
  console.log("JavaScript licenses HTML written to js-licenses.html");
};

main();
