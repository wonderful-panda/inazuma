/** Format files by prettier
 *  For vue SFC, format only in <script> and <style>.
 */
const prettier = require("prettier");
const glob = require("glob").sync;
const fs = require("fs");
const chalk = require("chalk");

/* RegExp to capture whole tag of script/style
 *
 *  group 1: open tag (e.g. "<script lang="ts">\n")
 *  group 2: tagName(script or style)
 *  group 3: code inside tag
 *  group 4: close tag (e.g. </script>)
 */
const tagPattern = /(^<(script|style).*>\r?\n)((?:.|\r\n|\n)+?)(^<\/\s*\2>)/gm;

/* RegExp to capture lang name from open tag (e.g. <script lang="ts">)
 *
 * group 1: quotation(["] or ['] or empty)
 * group 2: lang name (e.g. ts, tsx, scss)
 */
const langPattern = /\slang=('|"|)([a-z0-9]+)\1/i;

/**
 * Format vue single file compoenent
 *
 * @param {string} filepath - path of SFC
 * @param {string} content - content of file
 * @param {Object} options - prettier options object
 */
function formatVueFile(filepath, content, options) {
  return content.replace(
    tagPattern,
    (match, openTag, tagName, code, closeTag) => {
      const langMatch = langPattern.exec(openTag);
      let ext;
      if (langMatch) {
        ext = "." + langMatch[2];
      } else {
        ext = tagName === "script" ? ".js" : ".css";
      }
      const optionsWithFilepath = Object.assign(
        { filepath: filepath + ext },
        options
      );
      const formatted = prettier.format(code, optionsWithFilepath);
      return openTag + formatted + closeTag;
    }
  );
}

/**
 * Format specified file by prettier. (file will be overwritten)
 *
 * @param {string} filepath - path of file
 */
function processFile(filepath) {
  const content = fs.readFileSync(filepath).toString();
  const options = prettier.resolveConfig.sync(filepath) || {};
  let newContent;
  if (/\.vue$/i.test(filepath)) {
    newContent = formatVueFile(filepath, content, options);
  } else {
    newContent = prettier.format(content, { ...options, filepath });
  }
  if (content === newContent) {
    console.log(chalk.gray(filepath));
    return;
  }
  fs.writeFileSync(filepath, newContent);
  console.log(filepath);
}

function processFiles(files) {
  let hasError = false;
  for (let file of files) {
    try {
      processFile(file);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(chalk.red(file));
        console.error(e.message);
        hasError = true;
      } else {
        throw e;
      }
    }
  }
  return hasError ? -1 : 0;
}

const globPatterns = process.argv.slice(2);

if (globPatterns.length === 0) {
  console.error(chalk.red("glob pattern is not provided"));
  process.exit(-1);
}

let allFiles = [];
globPatterns.forEach(p => {
  const files = glob(p).filter(f => f.indexOf("node_modules") < 0);
  allFiles.push(...files);
});

ret = processFiles(allFiles);
process.exit(ret);
