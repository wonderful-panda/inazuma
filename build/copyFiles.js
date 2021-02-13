const cpx = require("cpx");

srcPaths = ["src/renderer/static/**/*.*"];

srcPaths.forEach(src => {
  cpx.copySync(src, "dist/renderer");
});
