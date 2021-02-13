const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
const babelrc = require("./build/babelrc");

module.exports = {
  // bundle for renderer process (per windows)
  context: __dirname,
  mode: "development",
  entry: {
    main: "./src/renderer/view/index.ts"
  },
  output: {
    path: path.join(__dirname, "./dist/renderer"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    assetModuleFilename: "[name].[ext]"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [path.join(__dirname, "./src/renderer"), "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "babel-loader", options: babelrc }, "ts-loader"]
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                fibers: require("fibers")
              }
            }
          },
        ]
      },
      {
        test: /\.ttf$/,
        type: "asset/inline"
      }
    ]
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename]
    }
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new MonacoEditorPlugin()
  ]
};
