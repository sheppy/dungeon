const path = require("path");
const webpack = require("webpack");
const VendorChunkPlugin = require("webpack-vendor-chunk-plugin");
const SplitByPathPlugin = require("webpack-split-by-path");

const phaserModule = path.dirname(require.resolve("phaser"));
const phaser = path.join(phaserModule, "custom/phaser-split.js");
const pixi = path.join(phaserModule, "custom/pixi.js");
const p2 = path.join(phaserModule, "custom/p2.js");

const PATHS = {
    app: path.join(__dirname, "src", "client"),
    build: path.join(__dirname, "lib", "js")
};

const config = {
    entry: {
        index: [PATHS.app]
    },
    resolve: {
        extensions: ["", ".js"],
        alias: {
            "phaser": phaser,
            "pixi": pixi,
            "p2": p2
        }
    },
    output: {
        path: PATHS.build,
        filename: "[name].js",
        publicPath: "/js/"
    },
    module: {
        preLoaders: [],

        loaders: [
            { test: /pixi\.js$/, loader: "expose?PIXI" },
            { test: /phaser-split\.js$/, loader: "expose?Phaser" },
            { test: /p2\.js$/, loader: "expose?p2" },
            {
                test: /.js$/,
                include: PATHS.app,
                loaders: ["babel-loader?cacheDirectory"]
            }
        ],

        postLoaders: []
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new SplitByPathPlugin([{
            name: "vendor",
            path: path.join(__dirname, "node_modules")
        }]),
        // new VendorChunkPlugin("vendor")
    ]
};


module.exports = {
    PATHS: PATHS,
    config: config
};
