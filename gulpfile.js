(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var gulp = require('gulp');
  var less = require('gulp-less');
  var sourcemaps = require('gulp-sourcemaps');
  var uglify = require('gulp-uglify');
  var csso = require('gulp-csso');
  var jshint = require('gulp-jshint');
  var stylish = require('jshint-stylish');
  var jscs = require('gulp-jscs');
  var mocha = require('gulp-spawn-mocha');
  var tar = require('gulp-tar');
  var gzip = require('gulp-gzip');
  var bumper = require('gulp-bump');
  var git = require('gulp-git');
  var shell = require('gulp-shell');
  var rename = require('gulp-rename');
  var sequence = require('gulp-sequence');
  var ngAnnotate = require('gulp-ng-annotate');
  var rimraf = require('gulp-rimraf');
  var istanbul = require('gulp-istanbul');
  var istanbulReport = require('gulp-istanbul-report');
  var mochaPhantomJS = require('gulp-mocha-phantomjs');

  gulp.task('clean', function () {
    return gulp.src('./dist/*', { read: false })
      .pipe(rimraf());
  });

  gulp.task('less', function () {
    return gulp.src('./*.less')
      .pipe(less())
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('css-min', function () {
    return gulp.src('./dist/*.css')
      .pipe(sourcemaps.init())
      .pipe(csso())
      .pipe(rename({ suffix: '.min' }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
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
        reporter: 'spec'
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
      .pipe(ngAnnotate({ single_quotes: true }))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('js', ['lint', 'style', 'bower'], function () {
    return gulp.src('./angular-chart.js')
      .pipe(rename('angular-chart.min.js'))
      .pipe(ngAnnotate({ single_quotes: true }))
      .pipe(sourcemaps.init())
      .pipe(uglify())
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
    gulp.watch('./*.less', ['less']);
    return true;
  });

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

  gulp.task('default', sequence('check', 'assets'));
  gulp.task('assets', sequence('clean', ['less', 'js'], 'css-min', 'build'));
  gulp.task('test', sequence('cover', 'unit', 'integration', 'report'));
  gulp.task('check', sequence(['lint', 'style'], 'test'));
  gulp.task('deploy-patch', sequence('default', 'bump-patch', 'update', 'git-commit', 'git-push', 'npm'));
  gulp.task('deploy-minor', sequence('default', 'bump-minor', 'update', 'git-commit', 'git-push', 'npm'));
  gulp.task('deploy-major', sequence('default', 'bump-patch', 'update', 'git-commit', 'git-push', 'npm'));

})();
