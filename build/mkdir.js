const fs = require("fs");
const { argv } = require("process");

const [, ...args] = process.argv;
argv.forEach((a) => {
  if (!fs.existsSync(a)) {
    console.log(`create directory: ${a}`);
    fs.mkdirSync(a);
  }
});
