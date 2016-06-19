# gulp-tar [![Build Status](https://travis-ci.org/sindresorhus/gulp-tar.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-tar)

> Create [tarball](http://en.wikipedia.org/wiki/Tar_(computing)) from files


## Install

```
$ npm install --save-dev gulp-tar
```


## Usage

```js
const gulp = require('gulp');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');

gulp.task('default', () =>
	gulp.src('src/*')
		.pipe(tar('archive.tar'))
		.pipe(gzip())
		.pipe(gulp.dest('dist'))
);
```


## API

### tar(filename, [options])

#### filename

Type: `string`

Filename for the output tar archive.

#### options

Type: `object`

Default file headers passed to [tar-stream](https://github.com/mafintosh/tar-stream).


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
