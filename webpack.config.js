var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = [
    {
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
            extensions: [".ts", ".js"],
            modules: [
                path.join(__dirname, "src/renderer"),
                "node_modules"
            ]
        },
        module: {
            loaders: [
                { test: /\.ts$/, loader: "ts-loader" },
                { test: /\.pug$/, loader: "vue-template-compiler-loader!./simple-pug-loader" }
            ]
        },
        plugins: [
            new webpack.ExternalsPlugin("commonjs", [
                "electron"
            ])
        ]
    },
    {
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
    },
    {
        context: path.join(__dirname, "style"),
        entry: "main.js",
        output: {
            path: path.join(__dirname, "dist"),
            filename: ".dummy.js"
        },
        resolve: {
            extensions: [".js"],
            modules: [
                path.join(__dirname, "style"),
                "node_modules"
            ]
        },
        module: {
            loaders: [
                { test: /\.(scss|css)$/, loader: ExtractTextPlugin.extract(["css-loader", "sass-loader?includePaths[]=./node_modules"]) },
                { test: /\.(eot|woff2|woff|ttf)$/, loader: "file-loader?name=[name].[ext]" }
            ]
        },
        plugins: [
            new ExtractTextPlugin("application.css")
        ]
    }
];
