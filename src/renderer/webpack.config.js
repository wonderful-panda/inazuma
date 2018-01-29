var webpack = require("webpack");
var path = require("path");
var ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");

var loadersForTs = [
  "cache-loader",
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
    main: "./view/main/index.ts"
  },
  output: {
    path: path.join(__dirname, "../../dist"),
    filename: "renderer_[name].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [__dirname, "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          "cache-loader",
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
        test: /\.tsx?$/,
        use: loadersForTs
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", ["electron"]),
    new ForkTsCheckerPlugin({ vue: true })
  ]
};
