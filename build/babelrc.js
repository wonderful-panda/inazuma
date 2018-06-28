const path = require("path");

module.exports = {
  presets: ["env"],
  plugins: [
    [
      "css-literal-loader/babel",
      {
        getFileName(hostFileName, options, id) {
          const dirName = path.dirname(hostFileName);
          const fileName = path.basename(hostFileName);
          const newFileName = fileName.replace(/\.[^.]+$/, `-${id}.scss`);
          return path.join(dirName, `__generated/${newFileName}`);
        }
      }
    ],
    "vue-jsx-modifier",
    "transform-vue-jsx",
    [
      "transform-runtime",
      {
        polyfill: false,
        regenerator: true
      }
    ]
  ]
};
