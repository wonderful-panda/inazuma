const path = require("path");
const glob = require("glob");
const sass = require("node-sass");
const chokidar = require("chokidar");
const DtsCreator = require("typed-css-modules");
const chalk = require("chalk");
const promisify = require("util").promisify;

const watch = process.argv.indexOf("-w") > 0;

const rootDir = process.cwd();
const searchDir = path.resolve(__dirname, "../src/renderer/view");
const pattern = searchDir + "/**/*.scss";

const creator = new DtsCreator({
  rootDir,
  searchDir,
  EOL: "\n"
});

function writeFile(file) {
  promisify(sass.render)({ file })
    .then(ret => creator.create(file, ret.css.toString(), watch))
    .then(content => content.writeFile())
    .then(content => {
      console.log("Wrote " + chalk.green(content.outputFilePath));
      content.messageList.forEach(message => {
        console.warn(chalk.yellow("[Warn] " + message));
      });
    })
    .catch(err => {
      console.error(err.formatted || err.toString());
    });
}

if (watch) {
  const watcher = chokidar.watch([pattern.replace(/\\/g, "/")]);
  watcher.on("add", file => setTimeout(() => writeFile(file), 100));
  watcher.on("change", file => setTimeout(() => writeFile(file), 100));
} else {
  glob(pattern, null, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    files.forEach(writeFile);
  });
}
