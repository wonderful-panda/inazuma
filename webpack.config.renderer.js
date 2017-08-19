var webpack = require("webpack");
var path = require("path");

module.exports = {
    // bundle for renderer process (per windows)
    context: path.join(__dirname, "src/renderer"),
    entry: {
        main: "./view/main/index.ts",
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "renderer_[name].js"
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        modules: [
            path.join(__dirname, "src/renderer"),
            "node_modules"
        ]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "babel-loader!ts-loader" },
            { test: /\.pug$/, loader: "vue-template-compiler-loader!./simple-pug-loader" }
        ]
    },
    plugins: [
        new webpack.ExternalsPlugin("commonjs", [
            "electron"
        ])
    ]
};
