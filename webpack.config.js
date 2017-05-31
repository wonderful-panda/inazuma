var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = [
    {
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
            extensions: [".ts", ".js"],
            modules: [
                path.join(__dirname, "src"),
                "node_modules"
            ]
        },
        module: {
            loaders: [
              { test: /\.ts$/, loader: "ts-loader" },
              { test: /\.pug$/, loader: "vue-template-compiler-loader!simple-pug-loader" }
            ]
        },
        resolveLoader: {
            alias: {
                "simple-pug-loader": path.join(__dirname, "simple-pug-loader")
            }
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
                { test: /\.(scss|css)$/, loader: ExtractTextPlugin.extract(["css-loader", "sass-loader"]) },
                { test: /\.(eot|woff2|woff|ttf)$/, loader: "file-loader?name=[name].[ext]" }
            ]
        },
        plugins: [
            new ExtractTextPlugin("application.css")
        ]
    }
];
