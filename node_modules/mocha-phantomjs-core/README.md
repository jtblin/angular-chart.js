# Run Mocha tests in PhantomJS

[![Build Status](https://secure.travis-ci.org/nathanboktae/mocha-phantomjs-core.png)](http://travis-ci.org/nathanboktae/mocha-phantomjs-core)

So now that you got your tests [Mocha](http://mochajs.org/) running on a simple flat HTML file, now how do you run them in your CI environment? [Karma](http://karma-runner.github.io/)? what is this `karma.conf.js` file I have to write? and some background runner task? how do I grep over just a few tests? wait I need a to also install a driver for phantomjs too? bleck.

Rather than force you to redo your test harness and local development testing, simply run `phantomjs mocha-phantomjs-core.js spec tests/mytests.html` and be done with it. `mocha-phantomjs-core` builds on top of what you already have, with no high barrier to entry like Karma.

## The core of [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs)

This project is the core phantomjs code for `mocha-phantomjs`. If you are a regular user wanting to use it from the command line, you'll want to go there. If you are a build plugin author, or want direct control over how phantomjs is invoked, you are in the right place.

## Installation

```
npm install mocha-phantomjs-core
```

## Usage

```
phantomjs mocha-phantomjs-core.js <TESTS> <REPORTER> <CONFIG as JSON>
```

Due to resource loading timing issues with external sources, you may need to call `initMochaPhantomJS` before calling any mocha setup functions like `setup()`, `ui()`, etc. `mocha-phantomjs-core` will notify you if you need this, and if so, add a check for it before your mocha setup code:

```
if (typeof initMochaPhantomJS === 'function') {
  initMochaPhantomJS()
}
```

This can be avoided by removing unnessecary external resources like fonts, CSS, etc. from your tests, or simply having `mocha.js` as the first script loaded.

### Config

It's best to always refer to [the tests](https://github.com/nathanboktae/mocha-phantomjs-core/blob/master/test/core.tests.coffee) for full usage and examples.

#### `reporter`

One of mocha's built in reporters, or a full path to a file for a 3rd party reporter (see below on how to write one).

#### `grep`

a string to pass to `mocha.grep()` to filter tests. also provide `invert: true` if you want to invert the grep and filter out tests.

#### `useColors`

Boolean. Force or suppress color usage. Defaults to what your terminal supports.

#### `bail`

Boolean. Stop the test run at the first failure if true. Defaults to false.

#### `ignoreResourceErrors`

Boolean. Suppress the resource failure output that `mocha-phantomjs-core` will output by default.

#### `timeout`

Time in milliseconds after the page loads that `mocha.run` needs to be called. Defaults to 10 seconds.

#### `viewportSize`

Sets the viewport size. Specify `height` and `width`, like below:

#### `settings`

If you need to pass [additional settings](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#webpage-settings) to the phantomjs webpage, you can specify an object of settings here, including common ones like `userAgent` and `loadImages`.

```
phantomjs mocha-phantomjs-core.js dot tests/mytests.html "{\"viewportSize\":{\"width\":720,\"height\":480}}"
```

Previously `mocha-phantomjs` required you to look for `mochaPhantomJS` and then use `mochaPhantomJS.run()`. That is no longer required. Call `mocha.run()` as you normally would.

## Screenshots

`mocha-phantomjs-core` supports creating screenshots from your test code. For example, you could write a function like below into your test code.

```javascript
function takeScreenshot() {
  if (window.callPhantom) {
    var date = new Date()
    var filename = "screenshots/" + date.getTime()
    console.log("Taking screenshot " + filename)
    callPhantom({'screenshot': filename})
  }
}
```

If you want to generate a screenshot for each test failure you could add the following into your test code.

```javascript
  afterEach(function () {
    if (this.currentTest.state == 'failed') {
      takeScreenshot()
    }
  })
```

## Environment variables

`mocha-phantomjs-core` will expose environment variables at `mocha.env`

## Third Party Reporters

Mocha has support for custom [3rd party reporters](https://github.com/mochajs/mocha/wiki/Third-party-reporters), and mocha-phantomjs does support 3rd party reporters, but keep in mind - *the reporter does not run in Node.js, but in the browser, and node modules can't be required.* You need to only use basic, vanilla JavaScript when using third party reporters. However, some things are available:

- `require`: You can only require other reporters, like `require('./base')` to build off of the BaseReporter
- `exports`, `module`: Export your reporter class as normal
- `process`: use `process.stdout.write` preferrably to support the `--file` option over `console.log` (see #114)

Also, no compilers are supported currently, so please provide plain ECMAScript 5 for your reporters.

## Testing

```
npm install
npm test
```

Travis CI does a matrix build against phantomjs 1.9.7 and 2.0.0, currently. See `.travis.yml` for the latest.

To debug an individual test, since they are just process forks, you may want to run them directly, like

```
phantomjs mocha-phantomjs-core.js test/timeout.html spec "{\"timeout\":500}"
```

## License

Released under the MIT license. Copyright (c) 2015 Ken Collins and Nathan Black.

