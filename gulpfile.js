const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const babel = require("gulp-babel")
const browserSync = require("browser-sync")
const concat = require("gulp-concat")
const eslint = require("gulp-eslint")
const filter = require("gulp-filter")
const newer = require("gulp-newer")
const notify = require("gulp-notify")
const plumber = require("gulp-plumber")
const reload = browserSync.reload
const sass = require("gulp-sass")
const sourcemaps = require("gulp-sourcemaps")

let onError = function(err) {
  notify.onError({
    title: "Error",
    message: "<%= error %>"
  })(err)
  this.emit("end")
}

let plumberOptions = {
  errorHandler: onError
}

let jsFiles = {
  components: [],
  source: [
    "assets/js/src/Utility.js",
    "assets/js/src/components/ComponentForm.jsx",
    "assets/js/src/components/Component.jsx"
  ]
}

// Lint JS/JSX files
gulp.task("eslint", function() {
  return gulp
    .src(jsFiles.source)
    .pipe(
      eslint({
        baseConfig: {
          ecmaFeatures: {
            jsx: true
          }
        }
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

// Copy react.js and react-dom.js to assets/js/src/components
// only if the copy in node_modules is "newer"
gulp.task("copy-react", function() {
  return gulp
    .src("node_modules/react/dist/react.js")
    .pipe(newer("assets/js/src/components/react.js"))
    .pipe(gulp.dest("assets/js/src/components"))
})
gulp.task("copy-react-dom", function() {
  return gulp
    .src("node_modules/react-dom/dist/react-dom.js")
    .pipe(newer("assets/js/src/components/react-dom.js"))
    .pipe(gulp.dest("assets/js/src/components"))
})

// Copy assets/js/components/* to assets/js
gulp.task("copy-js-components", function() {
  return gulp
    .src(["assets/js/src/components/react.js", "assets/js/src/components/react-dom.js"])
    .pipe(gulp.dest("assets/js"))
})

// Concatenate jsFiles.components and jsFiles.source into one JS file.
// Run copy-react and eslint before concatenating
gulp.task("concat", ["copy-react", "copy-react-dom", "eslint"], function() {
  return gulp
    .src(jsFiles.components.concat(jsFiles.source))
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        only: ["assets/js/src/components"],
        compact: false
      })
    )
    .pipe(concat("app.js"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("assets/js"))
})

// Compile Sass to CSS
gulp.task("sass", function() {
  let autoprefixerOptions = {
    browsers: ["last 2 versions"]
  }

  let filterOptions = "**/*.css"

  let reloadOptions = {
    stream: true
  }

  let sassOptions = {
    includePaths: []
  }

  return gulp
    .src("assets/sass/**/*.scss")
    .pipe(plumber(plumberOptions))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("assets/css"))
    .pipe(filter(filterOptions))
    .pipe(reload(reloadOptions))
})

// Watch JS/JSX and Sass files
gulp.task("watch", function() {
  gulp.watch("assets/js/src/**/*.{js,jsx}", ["concat"])
  gulp.watch("assets/sass/**/*.scss", ["sass"])
})

// BrowserSync
gulp.task("browsersync", function() {
  browserSync({
    server: {
      baseDir: "./"
    },
    open: false,
    online: false,
    notify: false
  })
})

gulp.task("build", ["sass", "copy-js-components", "concat"])
gulp.task("default", ["build", "browsersync", "watch"])
