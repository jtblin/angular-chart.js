var gulp = require('gulp');
var bump = require('../');

gulp.task('bump', function(){
  var options = {
    type: 'minor'
  };
  gulp.src('./package.json')
  .pipe(bump(options))
  .pipe(gulp.dest('./build'));
});

gulp.task('key', function(){
  gulp.src('./key.json')
  .pipe(bump({key: "appversion"}))
  .pipe(gulp.dest('./build'));
});

gulp.task('patch', function(){
  gulp.src('./package.json')
  .pipe(bump())
  .pipe(gulp.dest('./build'));
});

gulp.task('sublevel', function(){
  gulp.src('./sublevel.json')
  .pipe(bump({key: 'subversion.version'}))
  .pipe(gulp.dest('./build'));
});


gulp.task('default', ['bump']);
