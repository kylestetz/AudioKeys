var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var minify = require('gulp-minify');
var browserify = require('browserify');

gulp.task('build', function() {
  var b = browserify({
    entries: './src/AudioKeys.js',
    debug: false,
    standalone: 'AudioKeys',
  });

  return b.bundle()
    .pipe(source('audiokeys.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('minify', function() {
  var b = browserify({
    entries: './src/AudioKeys.js',
    debug: false,
    standalone: 'AudioKeys',
  });

  return b.bundle()
    .pipe(source('audiokeys.js'))
    .pipe(buffer())
    .pipe(minify({
        ext:{
            src:'.js',
            min:'.min.js'
        },
    }))
    .pipe(gulp.dest('./dist/'));
  ;
});

gulp.task('default', ['build', 'minify']);
