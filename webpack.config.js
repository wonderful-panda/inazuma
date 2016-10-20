var webpack = require("webpack");
var path = require("path");

module.exports = {
    context: path.join(__dirname, "src"),
    entry: {
        browser: "./browser/main.ts",
        renderer: "./renderer/main.ts"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    target: "node",
    node: {
        __dirname: false
    },
    devtool: 'source-map',
    resolve: {
        extensions: ["", ".ts", ".js"],
        root: path.join(__dirname, "src")
    },
    module: {
        loaders: [
          { test: /\.ts$/, loader: "ts" }
        ]
    },
    plugins: [
        new webpack.ExternalsPlugin("commonjs", [
            "electron",
            "nodegit"
        ])
    ]
};
