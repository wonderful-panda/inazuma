var webpack = require("webpack");
var path = require("path");
var ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");

var loadersForTs = [
  "babel-loader",
  "css-literal-loader",
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
        test: /\.(scss|css)$/,
        include: [path.resolve(__dirname, "view")],
        use: ["style-loader", "css-loader?modules", "sass-loader"]
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", ["electron"]),
    new ForkTsCheckerPlugin()
  ]
};
