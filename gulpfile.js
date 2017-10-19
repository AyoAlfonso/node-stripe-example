/**
 * Module Dependencies
 */

const gulp = require("gulp");
const jshint = require("gulp-jshint");
const browserSync = require("browser-sync");
const reload = browserSync.reload;
const nodemon = require("gulp-nodemon");
const connect = require("gulp-connect");
const uglify = require("gulp-uglify");
const minifyCSS = require("gulp-minify-css");
const clean = require("gulp-clean");
const concat = require("gulp-concat");
const runSequence = require("run-sequence");

/**
 * Config
 */

const paths = {
  styles: ["./src/client/css/*.css"],
  scripts: ["./src/client/js/*.js"],
  server: ["./src/server/bin/www"],
  distServer: ["./dist/server/bin/www"]
};

const nodemonConfig = {
  script: paths.server,
  ext: "html js css",
  ignore: ["node_modules"]
};

const nodemonDistConfig = {
  script: paths.distServer,
  ext: "html js css",
  ignore: ["node_modules"]
};

/**
 * Gulp Tasks
 */

gulp.task("lint", () =>
  gulp
    .src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
);

gulp.task("browser-sync", ["nodemon"], done => {
  browserSync(
    {
      proxy: "localhost:3000", // local node app address
      port: 5000, // use *different* port than above
      notify: true
    },
    done
  );
});

gulp.task("nodemon", cb => {
  let called = false;
  return nodemon(nodemonConfig)
    .on("start", () => {
      if (!called) {
        called = true;
        cb();
      }
    })
    .on("restart", () => {
      setTimeout(() => {
        reload({ stream: false });
      }, 1000);
    });
});

gulp.task("watch", () => {
  gulp.watch(paths.scripts, ["lint"]);
});

gulp.task("clean", () => {
  gulp.src("./dist/*").pipe(clean({ force: true }));
});

gulp.task("minify-css", () => {
  const opts = { comments: true, spare: true };
  gulp
    .src(paths.styles)
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest("./dist/client/css/"));
});

gulp.task("minify-js", () => {
  gulp
    .src(paths.scripts)
    .pipe(uglify())
    .pipe(gulp.dest("./dist/client/js/"));
});

gulp.task("copy-server-files", () => {
  gulp.src("./src/server/**/*").pipe(gulp.dest("./dist/server/"));
});

gulp.task("connectDist", cb => {
  let called = false;
  return nodemon(nodemonDistConfig)
    .on("start", () => {
      if (!called) {
        called = true;
        cb();
      }
    })
    .on("restart", () => {
      setTimeout(() => {
        reload({ stream: false });
      }, 1000);
    });
});

gulp.task("default", ["browser-sync", "watch"], () => {});

gulp.task("build", () => {
  runSequence(
    ["clean"],
    ["lint", "minify-css", "minify-js", "copy-server-files", "connectDist"]
  );
});
