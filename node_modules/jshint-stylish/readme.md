# jshint-stylish [![Build Status](https://travis-ci.org/sindresorhus/jshint-stylish.svg?branch=master)](https://travis-ci.org/sindresorhus/jshint-stylish)

> Stylish reporter for [JSHint](https://github.com/jshint/jshint)

---

<p align="center"><b>🔥 Want to strengthen your core JavaScript skills and master ES6?</b><br>I would personally recommend this awesome <a href="https://ES6.io/friend/AWESOME">ES6 course</a> by Wes Bos.</p>

---

![](screenshot.png)

Compared to the default reporter:

![](screenshot-default-reporter.png)


## Install

```
$ npm install --save-dev jshint-stylish
```


## Usage

### JSHint CLI

```
$ jshint --reporter=node_modules/jshint-stylish file.js
```

### [gulp-jshint](https://github.com/spalger/gulp-jshint)

```js
gulp.task('default', () =>
	gulp.src(['file.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
);
```

### [grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint)

```js
grunt.initConfig({
	jshint: {
		options: {
			reporter: require('jshint-stylish')
		},
		target: ['file.js']
	}
});

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.registerTask('default', ['jshint']);
```


## Options

#### beep

Type: `boolean`<br>
Default: `false`

The system bell will make a sound if there were any warnings or errors.

###### Gulp example

```js
gulp.task('default', () =>
	gulp.src(['file.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish', {beep: true}))
);
```


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
