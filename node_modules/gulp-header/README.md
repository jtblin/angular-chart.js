# gulp-header [![NPM version](https://badge.fury.io/js/gulp-header.png)](http://badge.fury.io/js/gulp-header) [![Build Status](https://travis-ci.org/tracker1/gulp-header.png)](https://travis-ci.org/tracker1/gulp-header)

gulp-header is a [Gulp](https://github.com/gulpjs/gulp) extension to add a header to file(s) in the pipeline.  [Gulp is a streaming build system](https://github.com/gulpjs/gulp) utilizing [node.js](http://nodejs.org/).

## Install

```javascript
npm install --save-dev gulp-header
```

## Usage

```javascript
// assign the module to a local variable
var header = require('gulp-header');


// literal string
// NOTE: a line separator will not be added automatically
gulp.src('./foo/*.js')
  .pipe(header('Hello'))
  .pipe(gulp.dest('./dist/'))


// ejs style templating
gulp.src('./foo/*.js')
  .pipe(header('Hello <%= name %>\n', { name : 'World'} ))
  .pipe(gulp.dest('./dist/'))


// ES6-style template string
gulp.src('./foo/*.js')
  .pipe(header('Hello ${name}\n', { name : 'World'} ))
  .pipe(gulp.dest('./dist/'))


// using data from package.json
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.src('./foo/*.js')
  .pipe(header(banner, { pkg : pkg } ))
  .pipe(gulp.dest('./dist/'))


// reading the header file from disk
var fs = require('fs');
gulp.src('./foo/*.js')
  .pipe(header(fs.readFileSync('header.txt', 'utf8'), { pkg : pkg } ))
  .pipe(gulp.dest('./dist/'))
```

## API

### header(text, data)

#### text

Type: `String`  
Default: `''`  

The template text.


#### data

Type: `Object`  
Default: `{}`  

The data object used to populate the text.

*NOTE: using `false` will disable template processing of the header* 
