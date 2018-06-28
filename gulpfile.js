const gulp = require("gulp");
const sass = require("gulp-sass");
const tildeImporter = require("node-sass-tilde-importer");
const shell = require("gulp-shell");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");

// copy files to dist
gulp.task("copy", () => {
  gulp
    .src([
      "src/renderer/static/**/*.*",
      "node_modules/monaco-editor/min/**/*.*",
      "node_modules/material-design-icons/iconfont/*.{css,eot,ttf,woff,woff2}",
      "node_modules/vue-material/dist/vue-material.min.css"
    ])
    .pipe(gulp.dest("dist/renderer"));
});

// build application.css
gulp.task("style", () => {
  gulp
    .src("src/renderer/style/application.scss")
    .pipe(
      sass({
        includePaths: ["node_modules"],
        importer: tildeImporter
      })
    )
    .pipe(gulp.dest("dist/renderer"));
});

gulp.task("renderer", () => {
  const config = require("./src/renderer/webpack.config");
  return webpackStream(config, webpack).pipe(gulp.dest("dist/renderer"));
});

gulp.task("watch:renderer", () => {
  const config = require("./src/renderer/webpack.config");
  return webpackStream({ ...config, watch: true }, webpack).pipe(
    gulp.dest("dist/renderer")
  );
});

// don't use gulp-typescript because 'tsc -w' is faster than it
gulp.task("browser", shell.task("tsc -p src/browser/tsconfig.json"));
gulp.task("watch:browser", shell.task("tsc -w -p src/browser/tsconfig.json"));

gulp.task("build", ["copy", "style", "renderer", "browser"]);
gulp.task("watch", ["copy", "style", "watch:renderer", "watch:browser"]);

gulp.task("default", ["build"]);
