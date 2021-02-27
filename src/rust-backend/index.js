const promisify = require("util").promisify;
const lib = require("./native");

module.exports = Object.keys(lib).reduce((prev, key) => {
  prev[key] = promisify(lib[key]);
  return prev;
}, {});
