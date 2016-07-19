(function () {
  'use strict';

  var bumper = require('gulp-bump');
  var fs = require('fs');
  var git = require('gulp-git');
  var gulp = require('gulp');
  var gzip = require('gulp-gzip');
  var header = require('gulp-header');
  var istanbul = require('gulp-istanbul');
  var istanbulReport = require('gulp-istanbul-report');
  var jshint = require('gulp-jshint');
  var jscs = require('gulp-jscs');
  var mocha = require('gulp-spawn-mocha');
  var mochaPhantomJS = require('gulp-mocha-phantomjs');
  var path = require('path');
  var pkg = require('./package.json');
  var rename = require('gulp-rename');
  var rimraf = require('gulp-rimraf');
  var sequence = require('gulp-sequence');
  var shell = require('gulp-shell');
  var sourcemaps = require('gulp-sourcemaps');
  var stylish = require('jshint-stylish');
  var tar = require('gulp-tar');
  var uglify = require('gulp-uglify');

  var banner = ['/*!',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * <%= pkg.homepage %>',
    ' * Version: <%= version %>',
    ' *',
    ' * Copyright 2016 Jerome Touffe-Blin',
    ' * Released under the <%= pkg.license %> license',
    ' * https://github.com/jtblin/angular-chart.js/blob/master/LICENSE',
    ' */',
    ''
  ].join('\n');

  gulp.task('clean', function () {
    return gulp.src('./dist/*', { read: false })
      .pipe(rimraf());
  });

  gulp.task('lint', function () {
    return gulp.src('**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
  });

  gulp.task('style', function () {
    return gulp.src('**/*.js')
      .pipe(jscs());
  });

  gulp.task('cover', function () {
    return gulp.src('angular-chart.js')
      .pipe(istanbul({ coverageVariable: '__coverage__' }))
      .pipe(rename('coverage.js'))
      .pipe(gulp.dest('test/fixtures'));
  });

  gulp.task('unit', function () {
    return gulp.src('test/index.html', { read: false })
      .pipe(mochaPhantomJS({
        phantomjs: {
          hooks: 'mocha-phantomjs-istanbul',
          coverageFile: 'coverage/coverage.json'
        },
        reporter: process.env.REPORTER || 'spec'
    }));
  });

  gulp.task('integration', function () {
    return gulp.src(path.join('test', 'test.integration.js'), { read: false })
      .pipe(mocha({ reporter: 'list', timeout: 20000, require: 'test/support/setup.js' }));
  });

  gulp.task('report', function () {
    return gulp.src('coverage/coverage.json')
      .pipe(istanbulReport({ reporters: ['lcov'] }));
  });

  gulp.task('bump-patch', bump('patch'));
  gulp.task('bump-minor', bump('minor'));
  gulp.task('bump-major', bump('major'));

  gulp.task('bower', function () {
    return gulp.src('./angular-chart.js')
      .pipe(header(banner, { pkg : pkg, version: version() } ))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('js', ['lint', 'style', 'bower'], function () {
    return gulp.src('./angular-chart.js')
      .pipe(header(banner, { pkg : pkg, version: version() } ))
      .pipe(rename('angular-chart.min.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify({ preserveComments: 'license' }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('build', function () {
    return gulp.src(['dist/*', '!./dist/*.tar.gz'])
      .pipe(tar('angular-chart.js.tar'))
      .pipe(gzip({ gzipOptions: { level: 9 } }))
      .pipe(gulp.dest('dist/'));
  });

  gulp.task('update', function (cb) {
    fs.readFile('./examples/charts.template.html', 'utf8', function (err, file) {
      if (err) return cb(err);
      file = file.replace('<!-- version -->', version());
      fs.writeFile('./examples/charts.html', file, cb);
    });
  });

  gulp.task('git-commit', function () {
    var v = version();
    gulp.src(['./dist/*', './package.json', './bower.json', './examples/charts.html', './test/fixtures/coverage.js'])
      .pipe(git.add())
      .pipe(git.commit(v))
    ;
  });

  gulp.task('git-push', function (cb) {
    var v = version();
    git.push('origin', 'master', function (err) {
      if (err) return cb(err);
      git.tag(v, v, function (err) {
        if (err) return cb(err);
        git.push('origin', 'master', {args: '--tags' }, cb);
      });
    });
  });

  gulp.task('npm', shell.task([
    'npm publish'
  ]));

  gulp.task('watch', function () {
    gulp.watch('./*.js', ['js']);
    return true;
  });

  gulp.task('docker-test', shell.task([
    'npm run docker-test'
  ]));

  function bump (level) {
    return function () {
      return gulp.src(['./package.json', './bower.json'])
        .pipe(bumper({type: level}))
        .pipe(gulp.dest('./'));
    };
  }

  function version () {
    return JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  }

  gulp.task('default', sequence('docker-test', 'assets'));
  gulp.task('assets', sequence('clean', 'js', 'build'));
  gulp.task('test', sequence('cover', 'unit', 'integration', 'report'));
  gulp.task('check', sequence(['lint', 'style'], 'test'));
  gulp.task('deploy-patch', sequence('docker-test', 'bump-patch', 'assets', 'update', 'git-commit', 'git-push', 'npm'));
  gulp.task('deploy-minor', sequence('docker-test', 'bump-minor', 'assets', 'update', 'git-commit', 'git-push', 'npm'));
  gulp.task('deploy-major', sequence('docker-test', 'bump-patch', 'assets', 'update', 'git-commit', 'git-push', 'npm'));

})();
