"use strict";

var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var cssmin = require('gulp-cssmin');


gulp.task('styles', function(){
    return gulp.src('./diazo_resources/static/css/theme.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(cssmin())
    .pipe(rename('theme-compiled.min.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./diazo_resources/static/dist'));
});

gulp.task('scripts', function() {
    return gulp.src(['./diazo_resources/static/js/main.js', './diazo_resources/static/js/foo.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('theme-compiled.js'))
    .pipe(uglify())
    .pipe(rename('theme-compiled.min.js')) 
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./diazo_resources/static/dist'));
});

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


gulp.task('watch', function() {
    function informUser (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
    var css_watcher = gulp.watch('./diazo_resources/static/css/*.less', ['styles', 'registry']);
    css_watcher.on('change', informUser);
    var js_watcher = gulp.watch('./diazo_resources/static/js/*.js', ['scripts', 'registry']);
    js_watcher.on('change', informUser);
});

gulp.task('build', ['styles', 'scripts', 'registry']);gulp.task('default', ['watch']);
