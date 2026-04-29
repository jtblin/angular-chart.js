(function () {
  'use strict';

  var bumper = require('gulp-bump');
  var fs = require('fs');
  var git = require('gulp-git');
  var gulp = require('gulp');
  var gzip = require('gulp-gzip');
  var header = require('gulp-header');
  var jshint = require('gulp-jshint');
  var jscs = require('gulp-jscs');
  var path = require('path');
  var pkg = require('./package.json');
  var rename = require('gulp-rename');
  var rimraf = require('gulp-rimraf');
  var shell = require('gulp-shell');
  var sourcemaps = require('gulp-sourcemaps');
  var stylish = require('jshint-stylish');
  var tar = require('gulp-tar');
  var uglify = require('gulp-uglify');
  var karma = require('karma');

  var banner = ['/*!',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * <%= pkg.homepage %>',
    ' * Version: <%= version %>',
    ' *',
    ' * Copyright 2016 Jerome Touffe-Blin',
    ' * Released under the <%= pkg.license %> license',
    ' * https://github.com/jtblin/angular-chart.js/blob/main/LICENSE',
    ' */',
    ''
  ].join('\n');

  function clean () {
    return gulp.src('./dist/*', { read: false, allowEmpty: true })
      .pipe(rimraf());
  }

  function lint () {
    return gulp.src('**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
  }

  function style () {
    return gulp.src('**/*.js')
      .pipe(jscs());
  }

  function unit (done) {
    new karma.Server({
      configFile: path.join(__dirname, 'karma.conf.js'),
      singleRun: true
    }, done).start();
  }

  function integration () {
    return gulp.src('.', { read: false })
      .pipe(shell(['npx playwright test']));
  }

  function bump (level) {
    return function () {
      return gulp.src(['./package.json', './bower.json'])
        .pipe(bumper({type: level}))
        .pipe(gulp.dest('./'));
    };
  }

  function bower () {
    return gulp.src('./angular-chart.js')
      .pipe(header(banner, { pkg : pkg, version: version() } ))
      .pipe(gulp.dest('./dist'));
  }

  function js () {
    return gulp.src('./angular-chart.js')
      .pipe(header(banner, { pkg : pkg, version: version() } ))
      .pipe(rename('angular-chart.min.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify({ output: { comments: /^!/ } }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

  function build () {
    return gulp.src(['dist/*', '!./dist/*.tar.gz'])
      .pipe(tar('angular-chart.js.tar'))
      .pipe(gzip({ gzipOptions: { level: 9 } }))
      .pipe(gulp.dest('dist/'));
  }

  function update (cb) {
    fs.readFile('./examples/charts.template.html', 'utf8', function (err, file) {
      if (err) return cb(err);
      file = file.replace('<!-- version -->', version());
      fs.writeFile('./examples/charts.html', file, cb);
    });
  }

  function gitCommit () {
    var v = version();
    return gulp.src(['./dist/*', './package.json', './bower.json', './examples/charts.html'])
      .pipe(git.add())
      .pipe(git.commit(v));
  }

  function gitPush (cb) {
    var v = version();
    git.push('origin', 'main', function (err) {
      if (err) return cb(err);
      git.tag(v, v, function (err) {
        if (err) return cb(err);
        git.push('origin', 'main', {args: '--tags' }, cb);
      });
    });
  }

  var npmPublish = shell.task([
    'npm publish'
  ]);

  function watch () {
    gulp.watch('./*.js', gulp.series(js));
  }

  function version () {
    return JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  }

  function serve () {
    return gulp.src('.', { read: false })
      .pipe(shell(['npx http-server -c-1']));
  }

  gulp.task('clean', clean);
  gulp.task('lint', lint);
  gulp.task('style', style);
  gulp.task('unit', unit);
  gulp.task('integration', integration);
  gulp.task('bower', bower);
  gulp.task('js', gulp.series(lint, style, bower, js));
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
  gulp.task('check', gulp.series(gulp.parallel(lint, style), 'test'));
  
  gulp.task('deploy-patch', gulp.series('check', 'bump-patch', 'assets', update, gitCommit, gitPush, npmPublish));
  gulp.task('deploy-minor', gulp.series('check', 'bump-minor', 'assets', update, gitCommit, gitPush, npmPublish));
  gulp.task('deploy-major', gulp.series('check', 'bump-major', 'assets', update, gitCommit, gitPush, npmPublish));

  gulp.task('default', gulp.series('assets'));

})();
