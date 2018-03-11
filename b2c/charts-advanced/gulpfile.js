var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
    return browserify({entries: './public/js/app.js', extensions: ['.js'], debug: true})
        .transform('babelify', {presets: ['es2015', 'react']})
        .bundle()
        .pipe(source('app_bundle.js'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', ['build'], function () {
    gulp.watch('./**/*.js', ['build']);
});

gulp.task('default', ['watch']);