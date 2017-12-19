var webpack = require("webpack");
var path = require("path");

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
    modules: [__dirname, "../../node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {
              loaders: {
                tsx: "babel-loader!ts-loader",
                ts: "babel-loader!ts-loader"
              }
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              appendTsxSuffixTo: [/\.vue$/]
            }
          }
        ]
      }
    ]
  },
  plugins: [new webpack.ExternalsPlugin("commonjs", ["electron"])]
};
