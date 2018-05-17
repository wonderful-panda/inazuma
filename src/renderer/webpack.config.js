var webpack = require("webpack");
var path = require("path");
var ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyPlugin = require("copy-webpack-plugin");

var cacheLoader = {
  loader: "cache-loader",
  options: {
    cacheDirectory: path.resolve(__dirname, ".cache-loader")
  }
};

var loadersForTs = [
  cacheLoader,
  "babel-loader",
  {
    loader: "ts-loader",
    options: {
      transpileOnly: true
    }
  }
];

module.exports = {
  // bundle for renderer process (per windows)
  context: __dirname,
  entry: {
    main: "./view/index.ts",
    __style: "./style/main.js"
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
        test: /\.(scss|css)$/,
        exclude: [path.resolve(__dirname, "view")],
        use: ExtractTextPlugin.extract([
          cacheLoader,
          "css-loader",
          "sass-loader"
        ])
      },
      {
        test: /\.scss$/,
        include: [path.resolve(__dirname, "view")],
        use: ["style-loader", "css-loader?modules", "sass-loader"]
      },
      {
        test: /\.(eot|woff2|woff|ttf)$/,
        loader: "file-loader?name=static/[name].[ext]"
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", ["electron"]),
    new ForkTsCheckerPlugin({ vue: true }),
    new ExtractTextPlugin("application.css"),
    new CopyPlugin([{ from: "static/**/*.*", dest: "." }])
  ]
};
