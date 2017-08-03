var webpack = require("webpack");
var path = require("path");

module.exports = {
    // bundle for browser process
    context: path.join(__dirname, "src/browser"),
    entry: "./main.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "browser.js"
    },
    target: "node",
    node: {
        __dirname: false
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".js"],
        modules: [
            path.join(__dirname, "src"),
            "node_modules"
        ]
    },
    module: {
        loaders: [
          { test: /\.ts$/, loader: "ts-loader" },
        ]
    },
    plugins: [
        new webpack.ExternalsPlugin("commonjs", [
            "electron",
            "nodegit"
        ])
    ]
};
