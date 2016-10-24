var pug = require("pug");

module.exports = function(source) {
    this.cacheable(true);
    return pug.compile(source)();
}
