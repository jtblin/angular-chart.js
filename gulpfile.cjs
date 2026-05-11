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

  const gulpIf = require('gulp-if');
  const tar = require('gulp-tar');
  const karma = require('karma');

  // Banner is now handled by Rollup

  function clean() {
    return gulp.src('./dist/*', {read: false, allowEmpty: true})
      .pipe(rimraf());
  }

  function lint() {
    const fix = process.argv.includes('--fix');
    return gulp.src(['**/*.{js,cjs,ts}', '!node_modules/**', '!dist/**'])
      .pipe(eslint({fix: fix}))
      .pipe(eslint.format())
      .pipe(gulpIf(fix, gulp.dest('.')))
      .pipe(eslint.failAfterError());
  }

  function bundleTest() {
    return gulp.src('.', {read: false})
      .pipe(shell(['npx rollup -c rollup.test.config.js']));
  }

  function unitTask(done) {
    new karma.Server({
      configFile: path.join(__dirname, 'karma.conf.cjs'),
      singleRun: true,
    }, done).start();
  }

  function integration() {
    const args = process.env.PLAYWRIGHT_ARGS || '';
    return gulp.src('.', {read: false})
      .pipe(shell([`npx playwright test ${args}`]));
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

  function copyCss() {
    return gulp.src('./src/*.css')
      .pipe(gulp.dest('./dist'));
  }

  function build() {
    return gulp.src(['dist/*', '!./dist/*.tar.gz'])
      .pipe(tar('angular-chart.js.tar'))
      .pipe(gzip({gzipOptions: {level: 9}}))
      .pipe(gulp.dest('dist/'));
  }

  function update(cb) {
    fs.readFile('./examples/charts.html', 'utf8', function(err, file) {
      if (err) {
        return cb(err);
      }
      file = file.replace(/Download <small>\(.*\)<\/small>/,
        'Download <small>(' + version() + ')</small>');
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
      .pipe(shell(['npx http-server -p 8080 -c-1']));
  }

  gulp.task('clean', clean);
  gulp.task('lint', lint);
  gulp.task('bundle-test', bundleTest);
  gulp.task('unit', gulp.series(bundleTest, unitTask));
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

  gulp.task('assets', gulp.series(clean, rollupTask, copyCss, build));
  gulp.task('test', gulp.series('unit', integration));
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
