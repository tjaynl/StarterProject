// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

// File path variables
const files = {
    sassPath: 'app/sass/**/*.sass',
    jsPath: 'app/js/**/*.js'
}

// Sass task
function css() {
    return src(files.sassPath)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([ autoprefixer(), cssnano() ]))
        .pipe(sourcemaps.write('.'))
        .pipe(rename({
            basename: 'main',
            suffix: ''
        }))
        .pipe(dest('dist/css'));
}

// JS task
function js() {
    return src(files.jsPath)
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'));
}

// Cashebusting task
const cbString = new Date().getTime();
function cashBust() {
    return src(['index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' +cbString))
        .pipe(dest('.'));
}

// Watch task
function watcher() {
    browserSync.init({
        server: {
            baseDir: "."
        },
        notify: false
    });
    watch(
        [files.sassPath, files.jsPath],
        parallel(css, js)
    );
    watch(['*.html', 'dist/css/*.css', 'dist/js/*.js']).on('change', browserSync.reload);
}

// Default task
exports.css = css;
exports.js = js;
exports.watcher = watcher;


exports.default = series(
    parallel(css, js),
    cashBust,
    watcher
);