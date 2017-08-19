var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
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
};
