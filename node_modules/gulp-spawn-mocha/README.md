# gulp-spawn-mocha

[![Build Status](https://travis-ci.org/KenPowers/gulp-spawn-mocha.png?branch=master)](https://travis-ci.org/KenPowers/gulp-spawn-mocha) [![Coverage Status](https://coveralls.io/repos/KenPowers/gulp-spawn-mocha/badge.png)](https://coveralls.io/r/KenPowers/gulp-spawn-mocha)

This is a plugin for [gulp][gulp] which runs [Mocha][mocha] tests in a
separate process from the `gulp` process. Each time tests are run a new child
process is created meaning the test environment always starts cleanly, i.e.,
globals are reset as are non-enumerable properties defined on native
prototypes via `Object.defineProperty`. This also means that if your tests
crash the node process (e.g., `process.exit(-1)`.) then an `error` event is
emitted rather than your whole `gulp` process crashing (good for watching).

## Usage

Usage is according to this API:

```javascript
stream.pipe(mocha({
  // options
}))
```

This plugin uses mocha version `^2` and as of version `2.0.0` matches the
major version of mocha. Please note that mocha is no longer a peer dependency
as peer dependencies are being deprecated. See [npm/npm#6565][npm] for more
info.

The plugin accepts these special options:

* `bin`: a path to a `mocha` executable to use instead of the one this plugin 
looks for by default. This is useful if you want to use a fork of `mocha` 
which goes by a different name or a different executable altogether.
* `env`: the environment variables that the child process will have access to
(key-value pairs, see [child_process::fork][fork]). These variables are 
merged with your current environment variables and sent to the mocha 
executable.
* `cwd`: the working directory for the child process. This can be used to put
files that the test creates or reads from the working directory in a specific 
directory, instead of the directory where you are running gulp from.

All other options are properly prefixed with either `-` or `--` and passed to
the `mocha` executable. Any arguments which do not take a value (e.g., `c`,
`colors`, or `debug`) should just have a value of `true`. Any arguments which
have dashes in the name can be specified by using camelCase (i.e., `debugBrk`
for `--debug-brk`, `inlineDiffs` for `--inline-diffs`, etc) so you don't have
to use strings for the argument names. Please note that the `gc` option must
be specified as `exposeGc` (please see [issue #21][21]). For an example, see
this plugin's very own `gulpfile.js`:

```javascript
const DEBUG = process.env.NODE_ENV === 'debug',
      CI = process.env.CI === 'true';

var gulp = require('gulp'),
    mocha = require('./lib');

gulp.task('test', function () {
  return gulp.src(['test/*.test.js'], {read: false})
    .pipe(mocha({
      debugBrk: DEBUG,
      r: 'test/setup.js',
      R: CI ? 'spec' : 'nyan',
      istanbul: !DEBUG
    }));
});

gulp.task('default', ['test'], function () {
  gulp.watch('{lib,test}/*', ['test']);
});
```

With this setup the `nyan` reporter will be used in development and the `spec`
reporter will be used in CI (Travis sets the `CI` environment variable to
`true` automatically).

The `default` task will execute tests and watch for changes and execute tests
whenever a change is detected.

### Conditional Arguments

If the value of an argument is falsy (but not `0`) then it will not be passed
to `mocha`. This is useful, for example, if you want to enable debugging only
when a certain environment variable is true. Example:

```javascript
const DEBUG = process.env.NODE_ENV === 'debug';
stream.pipe(mocha({
    debugBrk: DEBUG,
    istanbul: !DEBUG
}));
```

### Custom Environment Variables

As mentioned above an object provided underneath the `env` options key will
allow you to specify a custom environment. This is useful, for example, to run
your tests in a different NODE_ENV than the default. Such a gulp task would
look like this:

```javascript
var gulp = require('gulp'),
    mocha = require('gulp-spawn-mocha');

gulp.task('test', function() {
  return gulp
    .src(['test/*.test.js'])
    .pipe(mocha({
      env: {'NODE_ENV': 'test'}
    }));
});
```

These variables are merged with your current environment variables and sent to
the mocha executable.

### Code Coverage

Because of the nature of this plugin launching an external process to run
tests, the standard coverage plugins for gulp will not work with this module.
Starting in version `0.4.0` [Istanbul][ist] is included in order to enable
code coverage reports without having to instrument code on disk. You can use
it by passing the `istanbul` option. As noted previously peer dependencies are
being deprecated so Istanbul is no longer a peer dependency. See
[npm/npm#6565][npm] for more info.

Set `istanbul` to `true` if you want to use all the default settings:

```javascript
gulp.task('test', function() {
  return gulp
    .src(['test/*.test.js'])
    .pipe(mocha({
      istanbul: true
    }));
});
```

This will launch a process equivilant to:

```
istanbul cover -- _mocha
```

The default settings of Istanbul output to a directory in the `cwd` called
`coverage`.

If you want to pass options to Istanbul, you can do that as well:

```javascript
gulp.task('test', function() {
  return gulp
    .src(['test/*.test.js'])
    .pipe(mocha({
      istanbul: {
        dir: 'path/to/custom/output/directory'
      }
    }));
});
```

This will launch a process equivilant to:

```
istanbul cover --dir path/to/custom/output/directory -- _mocha
```

This will output to a directory called `path/to/custom/output/directory`.

Istanbul, like `mocha`, supports a custom `bin` option so you can use a custom
fork of Istanbul:

```javascript
gulp.task('test', function() {
  return gulp
    .src(['test/*.test.js'])
    .pipe(mocha({
      istanbul: {
        dir: 'path/to/custom/output/directory',
        bin: require.resolve('isparta') + '/bin/isparta'
      }
    }));
});
```

This will launch a process equivilant to:

```
./node_modules/isparta/bin/isparta cover --dir path/to/custom/output/directory -- _mocha
```

#### Publishing Coverage Reports

Assuming you are using [Travis][travis] for CI and [Coveralls][coveralls] for
publishing code coverage reports it is very easy to automatically have Travis
publish to Coveralls when tests are run successfully. First make sure you
install and save the `coveralls` module as a dev dependency:

```
npm i --save-dev coveralls
```

Then edit your `.travis.yml` to have an `after_success` command:

```yaml
language: node_js
node_js:
  - "0.11"
  - "0.10"
after_success: ./node_modules/.bin/coveralls --verbose < coverage/lcov.info
```

The `coveralls` module requires no additional configuration to publish to
Coveralls as long as both Travis and Coveralls are configured for the same
*public* repository. See [`node-coveralls`][ncov] for more details.

### Output Reports to a File

You can pass `output` option to write a report to a writeable stream. If
`output` is a string then a writeable stream will be created with `output` as
its path. Note, if you are using `istanbul`, your reports content may contain
`istanbul`'s result.

Use file path:
```js
gulp.task('test', function () {
  return gulp.src(['test/*.test.js'], {read: false})
    .pipe(mocha({
      debugBrk: DEBUG,
      r: 'test/setup.js',
      R: CI ? 'spec' : 'nyan',
      istanbul: !DEBUG,
      output: 'result.log'
    }));
});
```

Use file stream:
```js
gulp.task('test', function () {
  return gulp.src(['test/*.test.js'], {read: false})
    .pipe(mocha({
      debugBrk: DEBUG,
      r: 'test/setup.js',
      R: CI ? 'spec' : 'nyan',
      istanbul: !DEBUG,
      output: fs.createWriteStream('result.log', {flags: 'w'})
    }));
});
```


## This or `gulp-mocha`?

The original `gulp-mocha` is fine in most circumstances. If you need your
tests to run as a separate process (or a separate process is simply your
preference for the reasons specified above) or you need to use a custom
version of Mocha (e.g., a fork with bug fixes or custom functionality) then
you should use this plugin.

## License

**The MIT License**

Copyright (c) 2014-2015 Kenneth Powers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

  [gulp]: http://gulpjs.com/ "gulp.js"
  [mocha]: http://mochajs.org/ "Mocha"
  [fork]: http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options "child_process::fork"
  [ist]: https://github.com/gotwarlost/istanbul "Istanbul"
  [travis]: https://travis-ci.org/ "Travis CI"
  [coveralls]: https://coveralls.io/ "Coveralls"
  [ncov]: https://github.com/cainus/node-coveralls "node-coveralls"
  [npm]: https://github.com/npm/npm/issues/6565
  [21]: https://github.com/KenPowers/gulp-spawn-mocha/issues/21 "Issue 21: Setting `gc` option calls `mocha --gc` instead of `mocha -gc`"
