var webpack = require("webpack");
var path = require("path");
var ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  // bundle for browser process
  context: __dirname,
  entry: "./main.ts",
  output: {
    path: path.join(__dirname, "../../dist"),
    filename: "browser.js"
  },
  target: "node",
  node: {
    __dirname: false
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"],
    modules: [__dirname, "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          "cache-loader",
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", ["electron", "nodegit"]),
    new ForkTsCheckerPlugin()
  ]
};
