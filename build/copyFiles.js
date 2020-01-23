const cpx = require("cpx");

srcPaths = [
  "src/renderer/static/**/*.*",
  "node_modules/material-design-icons/iconfont/*.{css,eot,ttf,woff,woff2}",
  "node_modules/vue-material/dist/vue-material.min.css",
  "node_modules/xterm/css/xterm.css"
];

srcPaths.forEach(src => {
  cpx.copySync(src, "dist/renderer");
});
