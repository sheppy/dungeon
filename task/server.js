"use strict";

const path = require("path");
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const stripAnsi = require("strip-ansi");

const config = require("./config");
const webpackDevConfig = require("../webpack.config");


gulp.task("server", ["html"], () => {
    let webpackDevBundler = webpack(webpackDevConfig);

    // Reload all devices when bundle is complete
    // or send a fullscreen error message to the browser instead
    webpackDevBundler.plugin("done", function(stats) {
        // if (stats.hasErrors() || stats.hasWarnings()) {
        if (stats.hasErrors()) {
            return browserSync.sockets.emit("fullscreen:message", {
                title: "Webpack Error:",
                body: stripAnsi(stats.toString()),
                timeout: 100000
            });
        }
        browserSync.reload();
    });

    // Run Browsersync and use middleware for Hot Module Replacement
    browserSync.init({
        notify: false,
        ui: false,
        open: false,
        logFileChanges: false,
        server: {
            baseDir: config.dir.dist
        },
        middleware: [
            webpackDevMiddleware(webpackDevBundler, {
                publicPath: webpackDevConfig.output.publicPath,
                stats: { colors: true },
                noInfo: true
            })
        ],
        plugins: ["bs-fullscreen-message"],
        files: [
            path.join(config.dir.dist, config.glob.js),
            path.join(config.dir.dist, config.glob.html)
        ]
    });

    gulp.watch(path.join(config.dir.src, config.dir.client, config.glob.html), ["html"]);
});
