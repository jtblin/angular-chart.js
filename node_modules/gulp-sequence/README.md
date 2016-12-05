gulp-sequence
====
Run a series of gulp tasks in order.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## Install

Install with [npm](https://npmjs.org/package/gulp-sequence)

```
npm install --save-dev gulp-sequence
```


## Usage

```js
var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')

gulp.task('a', function (cb) {
  //... cb()
})

gulp.task('b', function (cb) {
  //... cb()
})

gulp.task('c', function (cb) {
  //... cb()
})

gulp.task('d', function (cb) {
  //... cb()
})

gulp.task('e', function (cb) {
  //... cb()
})

gulp.task('f', function () {
  // return stream
  return gulp.src('*.js')
})

// usage 1, recommend
// 1. run 'a', 'b' in parallel;
// 2. run 'c' after 'a' and 'b';
// 3. run 'd', 'e' in parallel after 'c';
// 3. run 'f' after 'd' and 'e'.
gulp.task('sequence-1', gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f'))

// usage 2
gulp.task('sequence-2', function (cb) {
  gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f', cb)
})

// usage 3
gulp.task('sequence-3', function (cb) {
  gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f')(cb)
})

gulp.task('gulp-sequence', gulpSequence('sequence-1', 'sequence-2', 'sequence-3'))
```

**with `gulp.watch`**:
```js
gulp.watch('src/**/*.js', function (event) {
  gulpSequence('a', 'b')(function (err) {
    if (err) console.log(err)
  })
})
```

## API

```js
var gulpSequence = require('gulp-sequence')
```

### gulpSequence('subtask1', 'subtask2',...[, callback])
return a [thunk](https://github.com/teambition/thunks) function.

```js
var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')

gulp.task('test', gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f'))
```

### gulpSequence.use(gulp)
return a new gulpSequence function with the gulp. If you have some errors such as "task xxx is not defined", this will resolve it.

```js
var gulp = require('gulp')
var gulpSequence = require('gulp-sequence').use(gulp)

gulp.task('test', gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f'))
```

## License

MIT © [Teambition](https://www.teambition.com)

[npm-url]: https://npmjs.org/package/gulp-sequence
[npm-image]: http://img.shields.io/npm/v/gulp-sequence.svg

[travis-url]: https://travis-ci.org/teambition/gulp-sequence
[travis-image]: http://img.shields.io/travis/teambition/gulp-sequence.svg

[downloads-url]: https://npmjs.org/package/gulp-sequence
[downloads-image]: http://img.shields.io/npm/dm/gulp-sequence.svg?style=flat-square
