const gulp = require("gulp");

gulp.task("lint", ["js-lint"]);

gulp.task("dev", ["html", "js-dev"]);

gulp.task("prod", ["html", "js-prod"]);

gulp.task("default", ["prod"]);
