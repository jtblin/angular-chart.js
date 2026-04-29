(function() {
  'use strict';

  const bumper = require('gulp-bump');
  const fs = require('fs');
  const git = require('gulp-git');
  const gulp = require('gulp');
  const gzip = require('gulp-gzip');
  const header = require('gulp-header');
  const eslint = require('gulp-eslint-new');
  const path = require('path');
  const pkg = require('./package.json');
  const rename = require('gulp-rename');
  const rimraf = require('gulp-rimraf');
  const shell = require('gulp-shell');
  const sourcemaps = require('gulp-sourcemaps');

  const tar = require('gulp-tar');
  const uglify = require('gulp-uglify');
  const karma = require('karma');

  const banner = ['/*!',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * <%= pkg.homepage %>',
    ' * Version: <%= version %>',
    ' *',
    ' * Copyright 2016-2026 Jerome Touffe-Blin',
    ' * Released under the <%= pkg.license %> license',
    ' * https://github.com/jtblin/angular-chart.js/blob/main/LICENSE',
    ' */',
    '',
  ].join('\n');

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


  function js() {
    return gulp.src('./angular-chart.js')
      .pipe(header(banner, {pkg: pkg, version: version()}))
      .pipe(rename('angular-chart.min.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify({output: {comments: /^!/}}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

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
    return gulp.src([
      './dist/*',
      './package.json',
      './examples/charts.html',
    ])
      .pipe(git.add())
      .pipe(git.commit(v));
  }

  function gitPush(cb) {
    const v = version();
    git.push('origin', 'main', function(err) {
      if (err) {
        return cb(err);
      }
      git.tag(v, v, function(err) {
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

  function watch() {
    gulp.watch('./*.js', gulp.series(js));
  }

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
  gulp.task('js', gulp.series(lint, js));
  gulp.task('build', build);
  gulp.task('update', update);
  gulp.task('git-commit', gitCommit);
  gulp.task('git-push', gitPush);
  gulp.task('npm', npmPublish);
  gulp.task('watch', watch);
  gulp.task('serve', serve);

  gulp.task('bump-patch', bump('patch'));
  gulp.task('bump-minor', bump('minor'));
  gulp.task('bump-major', bump('major'));

  gulp.task('assets', gulp.series(clean, 'js', build));
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
