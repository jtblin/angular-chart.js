const DEBUG = process.env.NODE_ENV === 'debug',
      CI = process.env.CI === 'true';

var gulp = require('gulp'),
    mocha = require('./lib');

gulp.task('test', function () {
  return gulp.src(['test/*.test.js'], {read: false})
    .pipe(mocha({
      debugBrk: DEBUG,
      r: 'test/setup.js',
      R: CI ? 'spec' : 'nyan',
      istanbul: !DEBUG
    }));
});

gulp.task('default', ['test'], function () {
  gulp.watch('{lib,test}/*', ['test']);
});
