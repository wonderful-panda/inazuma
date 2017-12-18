const prettier = require("prettier");
const glob = require("glob").sync;
const fs = require("fs");
const async = require("async");

const files = glob("src/renderer/**/*.vue");

/**
 *  group 1: open tag (e.g. <script lang="ts">)
 *  group 2: tagName ("script" or "style")
 *  group 3: code inside tag
 *  group 4: close tag (e.g. </script>)
 */
const tagRe = /(^<(script|style)(?:\s+lang="[a-z]+")>\r?\n)((?:.|\r\n|\n)+)(^<\/\s*\2>)/mg;

async function processFiles(files) {
  let hasError = false;
  for (let f of files) {
    try {
      const content = fs.readFileSync(f).toString();
      const options = (await prettier.resolveConfig(f)) || {};
      const newContent = content.replace(tagRe, (match, openTag, tagName, code, closeTag) => {
        const parser = tagName === "script" ? "typescript" : "scss";
        const formatted = prettier.format(code, { ...options, parser });
        return openTag + formatted + closeTag;
      });
      if (content === newContent) {
        continue;
      }
      console.log(f);
      fs.writeFileSync(f, newContent);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(f);
        console.error(e.message);
        hasError = true;
      } else {
        throw e;
      }
    }
  }
  return hasError ? -1 : 0;
}

const pattern = process.argv[2];
if (!pattern) {
  console.error("glob pattern is not provided");
  process.exit(-1);
}

processFiles(glob(pattern)).then(ret => {
  process.exit(ret);
}).catch(e => {
  throw e;
});

/*
let hasError = false;

files.forEach(f => {
  try {
    const content = fs.readFileSync(f).toString();
    const newContent = content.replace(tagRe, (match, openTag, tagName, code, closeTag) => {
      const parser = tagName === "script" ? "typescript" : "scss";
      const formatted = prettier.format(code, { parser });
      return openTag + formatted + closeTag;
    });
    if (content === newContent) {
      return;
    }
    console.log(f);
    fs.writeFileSync(f, newContent);
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error(f);
      console.error(e.message);
      hasError = true;
    } else {
      throw e;
    }
  }
});

process.exit(hasError ? -1 : 0);
*/
