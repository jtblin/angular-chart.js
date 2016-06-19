'use strict'

var gulp = require('gulp')
var gutil = require('gulp-util')
var mocha = require('gulp-mocha')
var hf = require('gulp-headerfooter')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var beautify = require('gulp-beautify')
var standard = require('gulp-standard')

var DEST = 'dist/'

var paths = ['gulpfile.js', 'src/dot-object.js', 'test/**/*.js']

gulp.task('lint', function () {
  gulp.src(paths)
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

gulp.task('mocha', function () {
  gulp.src(['test/**/*.js'])
    .pipe(mocha())
    .on('error', gutil.log)
})

gulp.task('watch', function () {
  gulp.watch(paths, ['build-node', 'mocha'])
})

gulp.task('build-node', function () {
  gulp.src('src/dot-object.js')
    .pipe(hf.footer('\nmodule.exports = DotObject;\n'))
    .pipe(rename({basename: 'index'}))
    .pipe(gulp.dest('./'))
})

gulp.task('build-bower', function () {
  gulp.src('src/dot-object.js')
    .pipe(hf.header('src/header.tpl'))
    .pipe(hf.footer('src/footer.tpl'))
    .pipe(beautify({indentSize: 2}))
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(DEST))
})

gulp.task('dist', ['lint', 'build-node', 'mocha', 'build-bower'])

gulp.task('test', ['lint', 'build-node', 'mocha'])

gulp.task('default', ['test'])
