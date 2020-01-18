var webpack = require("webpack");
var path = require("path");
var MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
var babelrc = require("../../build/babelrc");
var cacheLoader = {
  loader: "cache-loader",
  options: {
    cacheDirectory: path.join(__dirname, ".cache-loader")
  }
};

var loadersForTs = [
  cacheLoader,
  {
    loader: "babel-loader",
    options: babelrc
  },
  {
    loader: "ts-loader"
  }
];

module.exports = {
  // bundle for renderer process (per windows)
  context: __dirname,
  mode: "development",
  entry: {
    main: "./view/index.ts"
  },
  output: {
    path: path.join(__dirname, "../../dist/renderer"),
    filename: "[name].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [__dirname, "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: loadersForTs
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", ["electron", "node-pty"]),
    new MonacoEditorPlugin()
  ]
};
