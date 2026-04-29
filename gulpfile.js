(function() {
  'use strict';

  const bumper = require('gulp-bump');
  const fs = require('fs');
  const git = require('gulp-git');
  const gulp = require('gulp');
  const gzip = require('gulp-gzip');
  const eslint = require('gulp-eslint-new');
  const path = require('path');
  const rimraf = require('gulp-rimraf');
  const shell = require('gulp-shell');

  const tar = require('gulp-tar');
  const karma = require('karma');

  // Banner is now handled by Rollup

  function clean() {
    return gulp.src('./dist/*', {read: false, allowEmpty: true})
      .pipe(rimraf());
  }

  function lint() {
    return gulp.src(['**/*.js', '!node_modules/**', '!dist/**'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }

  function unit(done) {
    new karma.Server({
      configFile: path.join(__dirname, 'karma.conf.js'),
      singleRun: true,
    }, done).start();
  }

  function integration() {
    return gulp.src('.', {read: false})
      .pipe(shell(['npx playwright test']));
  }

  function bump(level) {
    return function() {
      return gulp.src(['./package.json'])
        .pipe(bumper({type: level}))
        .pipe(gulp.dest('./'));
    };
  }


  function rollupTask() {
    return gulp.src('.', {read: false})
      .pipe(shell(['npx rollup -c']));
  }

  // js() task removed in favor of Rollup

  function build() {
    return gulp.src(['dist/*', '!./dist/*.tar.gz'])
      .pipe(tar('angular-chart.js.tar'))
      .pipe(gzip({gzipOptions: {level: 9}}))
      .pipe(gulp.dest('dist/'));
  }

  function update(cb) {
    fs.readFile('./examples/charts.template.html', 'utf8', function(err, file) {
      if (err) {
        return cb(err);
      }
      file = file.replace('<!-- version -->', version());
      fs.writeFile('./examples/charts.html', file, cb);
    });
  }

  function gitCommit() {
    const v = version();
    return gulp.src('.')
      .pipe(git.add())
      .pipe(git.commit(v));
  }

  function gitPush(cb) {
    const v = version();
    git.push('origin', 'main', function(err) {
      if (err) {
        return cb(err);
      }
      git.tag('v' + v, v, function(err) {
        if (err) {
          return cb(err);
        }
        git.push('origin', 'main', {args: '--tags'}, cb);
      });
    });
  }

  const npmPublish = shell.task([
    'npm publish',
  ]);


  function version() {
    return JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  }

  function serve() {
    return gulp.src('.', {read: false})
      .pipe(shell(['npx http-server -c-1']));
  }

  gulp.task('clean', clean);
  gulp.task('lint', lint);
  gulp.task('unit', unit);
  gulp.task('integration', integration);
  gulp.task('build', build);
  gulp.task('update', update);
  gulp.task('git-commit', gitCommit);
  gulp.task('git-push', gitPush);
  gulp.task('npm', npmPublish);
  gulp.task('serve', serve);

  gulp.task('bump-patch', bump('patch'));
  gulp.task('bump-minor', bump('minor'));
  gulp.task('bump-major', bump('major'));

  gulp.task('assets', gulp.series(clean, rollupTask, build));
  gulp.task('test', gulp.series(unit, integration));
  gulp.task('check', gulp.series(lint, 'test'));

  gulp.task('deploy-patch', gulp.series(
    'check', 'bump-patch', 'assets', update, gitCommit, gitPush, npmPublish,
  ));
  gulp.task('deploy-minor', gulp.series(
    'check', 'bump-minor', 'assets', update, gitCommit, gitPush, npmPublish,
  ));
  gulp.task('deploy-major', gulp.series(
    'check', 'bump-major', 'assets', update, gitCommit, gitPush, npmPublish,
  ));

  gulp.task('default', gulp.series('assets'));
})();
