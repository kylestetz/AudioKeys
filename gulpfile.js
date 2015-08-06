var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function() {
  return gulp.src([
      './src/AudioKeys.js',
      './src/AudioKeys.state.js',
      './src/AudioKeys.events.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('audiokeys.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
  ;
});