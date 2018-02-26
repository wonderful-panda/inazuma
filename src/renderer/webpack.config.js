var webpack = require("webpack");
var path = require("path");
var ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

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
      appendTsxSuffixTo: [/\.vue$/],
      transpileOnly: true
    }
  }
];

module.exports = {
  // bundle for renderer process (per windows)
  context: __dirname,
  entry: {
    renderer_main: "./view/main/index.ts",
    __style: "./style/main.js"
  },
  output: {
    path: path.join(__dirname, "../../dist"),
    filename: "[name].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"],
    modules: [__dirname, "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          cacheLoader,
          {
            loader: "vue-loader",
            options: {
              loaders: {
                ts: loadersForTs,
                tsx: loadersForTs
              }
            }
          }
        ]
      },
      {
        test: /\.ts$/,
        use: loadersForTs
      },
      {
        test: /\.(scss|css)$/,
        use: ExtractTextPlugin.extract([
          cacheLoader,
          "css-loader",
          "sass-loader"
        ])
      },
      {
        test: /\.(eot|woff2|woff|ttf)$/,
        loader: "file-loader?name=[name].[ext]"
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", ["electron"]),
    new ForkTsCheckerPlugin({ vue: true }),
    new ExtractTextPlugin("application.css")
  ]
};
