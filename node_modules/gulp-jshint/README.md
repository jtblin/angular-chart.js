[![Build Status](https://travis-ci.org/spalger/gulp-jshint.svg?branch=master)](https://travis-ci.org/spalger/gulp-jshint)

## Information

<table>
<tr>
<td>Package</td><td>gulp-jshint</td>
</tr>
<tr>
<td>Description</td>
<td>JSHint plugin for gulp</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.4</td>
</tr>
</table>

## Install

```sh
npm install jshint gulp-jshint --save-dev
```

***NOTE:*** as of 2.0 jshint must be installed with gulp-jshint.

## Usage

```js
const jshint = require('gulp-jshint');
const gulp   = require('gulp');

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
});
```

## Options

Plugin options:

- `lookup`
  - Default is `true`
  - When `false` do not lookup `.jshintrc` files. See the [JSHint docs](http://www.jshint.com/docs/) for more info.

- `linter`
  - Default is `"jshint"`
  - Either the name of a module to use for linting the code or a linting function itself. This enables using an alternate (but jshint compatible) linter like `"jsxhint"`.
  - Here's an example of passing in a module name:

    ```js
      gulp.task('lint', function() {
        return gulp.src('./lib/*.js')
          .pipe(jshint({ linter: 'some-jshint-module' }))
          .pipe(/*...*/);
      });
    ```

  - Here's an example of passing in a linting function:

    ```js
      gulp.task('lint', function() {
        return gulp.src('./lib/*.js')
          // This is available for modules like jshint-jsx, which
          // expose the normal jshint function as JSHINT and the
          // jsxhint function as JSXHINT
          .pipe(jshint({ linter: require('jshint-jsx').JSXHINT }))
          .pipe(/*...*/);
      });
    ```

You can pass in any other options and it passes them straight to JSHint. Look at their README for more info. You can also pass in the location of your jshintrc file as a string and it will load options from it.

For example, to load your configuration from your `package.json` exclusively and avoid lookup overhead you can do:

```js
const pkg = require('./package');
const jshintConfig = pkg.jshintConfig;

jshintConfig.lookup = false;

gulp.src('yo').pipe(jshint(jshintConfig));
```

## Results

Adds the following properties to the file object:

```js
file.jshint.success = true; // or false
file.jshint.errorCount = 0; // number of errors returned by JSHint
file.jshint.results = []; // JSHint errors, see [http://jshint.com/docs/reporters/](http://jshint.com/docs/reporters/)
file.jshint.data = []; // JSHint returns details about implied globals, cyclomatic complexity, etc
file.jshint.opt = {}; // The options you passed to JSHint
```

## Reporters

### JSHint reporters

#### Built-in

You can choose any [JSHint reporter](https://github.com/jshint/jshint/tree/master/src/reporters)
when you call

```js
stuff
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
```

#### External

Let's use [jshint-stylish](https://github.com/sindresorhus/jshint-stylish) as an example

```js
const stylish = require('jshint-stylish');

stuff
  .pipe(jshint())
  .pipe(jshint.reporter(stylish))
```

- OR -

```js
stuff
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
```

JSHint plugins have no good module format so I tried to support all of them I saw in the wild. Hopefully it worked, but if a JSHint plugin isn't working with this library feel free to open an issue.

### Fail Reporter

Do you want the task to fail when a JSHint error happens? gulp-jshint includes a simple utility for this.

This example will log the errors using the stylish reporter, then fail if JSHint was not a success.

```js
stuff
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'))
```

### Custom Reporters

Custom reporters don't interact with this module at all. jshint will add some attributes to the file object and you can add a custom reporter downstream.

```js
const jshint = require('gulp-jshint');
const map = require('map-stream');

const myReporter = map(function (file, cb) {
  if (file.jshint.success) {
    return cb(null, file);
  }

  console.log('JSHINT fail in', file.path);
  file.jshint.results.forEach(function (result) {
    if (!result.error) {
      return;
    }

    const err = result.error
    console.log(`  line ${err.line}, col ${err.character}, code ${err.code}, ${err.reason}`);
  });

  cb(null, file);
});

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(myReporter);
});
```

### Reporter Configuration

Some reporters have options which you can pass to `jshint.reporter()`. Here is an example of using verbose mode with the default JSHint reporter.

```js
gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});
```

## Extract

Tells JSHint to extract JavaScript from HTML files before linting (see [JSHint CLI flags](http://www.jshint.com/docs/cli/)). Keep in mind that it doesn't override the file's content after extraction. This is your tool of choice to lint web components!

```js
gulp.task('lintHTML', function() {
  return gulp.src('./src/*.html')
    // if flag is not defined default value is 'auto'
    .pipe(jshint.extract('auto|always|never'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
```

## LICENSE

[MIT](LICENSE)
