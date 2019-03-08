"use strict";

var concat = require('gulp-concat');
// var cssmin = require('gulp-cssmin');
var del = require('del');
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require("gulp-rename");
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sourcemaps = require('gulp-sourcemaps');
// var uglify = require('gulp-uglify');
var xmlTransformer = require("gulp-xml-transformer");

/* cssmin and uglify are commented for now to prevent merge conflicts
   on very commit. when dev/prod have different builds we can restore this */

gulp.task('styles', function(){
    return gulp.src('./diazo_resources/static/css/theme.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    //.pipe(cssmin())
    //.pipe(rename('theme-compiled.min.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./diazo_resources/static/dist'));
});

gulp.task('scripts', function() {
    return gulp.src(['./diazo_resources/static/js/main.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('theme-compiled.js'))
    //.pipe(uglify())
    //.pipe(rename('theme-compiled.min.js'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./diazo_resources/static/dist'));
});

gulp.task('clean', function () {
    // delete everything in the 'dist' folder
    return del.sync(['./diazo_resources/static/dist/**/*']);
});

gulp.task('revision', ['clean','styles', 'scripts'], function() {
    return gulp.src(['./diazo_resources/static/dist/theme-compiled.css',
                     './diazo_resources/static/dist/theme-compiled.js'])
    .pipe(rev())
    .pipe(gulp.dest('./diazo_resources/static/dist/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./diazo_resources/static/dist/'))
});

gulp.task("revreplace", ["revision"], function() {
    var manifest = gulp.src("./diazo_resources/static/dist/rev-manifest.json");
    return gulp.src("./diazo_resources/index.html.tmpl")
    .pipe(rename('./index.html'))
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest("./diazo_resources"))
});

/* Here in case you need it, commented out for your sanity.
   If you decide to use this, remove the cache-busting above (revision and revreplace)
   and remove the corresponding link/scripts tags from index.html.

gulp.task('registry', function() {
    var date = new Date();
    var year = date.getFullYear();
    function zeroPad(item) {
        if (item < 10) {
            return "0" + item;
        }
        return item;
    }
    var month = zeroPad(date.getMonth() + 1);
    var day = zeroPad(date.getDate());
    var hours = zeroPad(date.getHours());
    var minutes = zeroPad(date.getMinutes());
    var seconds = zeroPad(date.getSeconds());
    var timestamp = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    gulp.src("./profiles/default/registry.xml")
    .pipe(xmlTransformer([
        { path: "//value[@key='last_compilation']", text: timestamp },
    ]))
    .pipe(gulp.dest("./profiles/default/"));
});
*/

gulp.task('watch', function() {
    function informUser (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
    var watcher = gulp.watch(['./diazo_resources/static/css/*',
                              './diazo_resources/static/js/*.js',
                              './diazo_resources/index.html.tmpl'], ['revreplace']);
    watcher.on('change', informUser);
});

gulp.task('build', ['revreplace']);
gulp.task('default', ['watch']);
