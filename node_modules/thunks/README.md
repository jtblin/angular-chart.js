thunks
====
A small and magical composer for all JavaScript asynchronous.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![js-standard-style][js-standard-image]][js-standard-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

[中文说明](https://github.com/thunks/thunks/blob/master/README_zh.md)

[thunks 的作用域和异常处理设计](https://github.com/thunks/thunks/blob/master/docs/scope-and-error-catch.md)

## Compatibility

ES3+, support node.js and all browsers.

## Implementations:

- [Toa](https://github.com/toajs/toa) A powerful web framework rely on thunks.
- [T-man](https://github.com/thunks/tman) Super test manager for JavaScript.
- [thunk-redis](https://github.com/thunks/thunk-redis) The fastest thunk/promise-based redis client, support all redis features.
- [thunk-disque](https://github.com/thunks/thunk-disque) A thunk/promise-based disque client.
- [thunk-stream](https://github.com/thunks/thunk-stream) Wrap a readable/writable/duplex/transform stream to a thunk.
- [thunk-queue](https://github.com/thunks/thunk-queue) A thunk queue for uncertainty tasks evaluation.
- [thunk-loop](https://github.com/thunks/thunk-loop) Asynchronous tasks loop (while (true) { ... }).
- [thunk-mocha](https://github.com/thunks/thunk-mocha) Enable support for generators in Mocha with backward compatibility.
- [thunk-ratelimiter](https://github.com/thunks/thunk-ratelimiter) The fastest abstract rate limiter.
- [thunk-workers](https://github.com/thunks/thunk-workers) Thunk-based task scheduler that executes synchrounous and/or asynchronous tasks under concurrency control.
- [file-cache](https://github.com/thunks/file-cache) Read file with caching, rely on thunks.

And a mountain of applications in server-side or client-side.

## What is a thunk?

0. [ALGOL thunks in 1961](http://archive.computerhistory.org/resources/text/algol/ACM_Algol_bulletin/1064045/frontmatter.pdf)

1. **`thunk`** is a function that encapsulates synchronous or asynchronous code inside.

2. **`thunk`** accepts only one `callback` function as an arguments, which is a CPS function.

3. **`thunk`** returns another **`thunk`** function after being called, for chaining operations.

4. **`thunk`** passes the results into a `callback` function after being excuted.

5. If the return value of `callback` is a **`thunk`** function, then it will be executed first and its result will be send to another **`thunk`** for excution,
or it will be sent to another new **`thunk`** function as the value of the computation.

## Demo

```js
var thunk = require('thunks')()
var fs = require('fs')

var size = thunk.thunkify(fs.stat)

// generator
thunk(function *() {

  // sequential
  console.log(yield size('.gitignore'))
  console.log(yield size('thunks.js'))
  console.log(yield size('package.json'))

})(function *(error, res) {
  //parallel
  console.log(yield thunk.all([
    size('.gitignore'),
    size('thunks.js'),
    size('package.json')
  ]))
})()
```

```js
var thunk = require('thunks')()
var fs = require('fs')

var size = thunk.thunkify(fs.stat)

// sequential
size('.gitignore')(function (error, res) {
  console.log(error, res)
  return size('thunks.js')

})(function (error, res) {
  console.log(error, res)
  return size('package.json')

})(function (error, res) {
  console.log(error, res)
})

// parallel
thunk.all([
  size('.gitignore'),
  size('thunks.js'),
  size('package.json')
])(function (error, res) {
  console.log(error, res)
})

// sequential
thunk.seq([
  size('.gitignore'),
  size('thunks.js'),
  size('package.json')
])(function (error, res) {
  console.log(error, res)
})
```

### There is a break change in V4.x relative to V3.x, two or more results will become a array of results.

**v3.x:**
```js
thunk(function (done) {
  done(null, 1, 2, 3)
})(function (error, res) {
  console.log.apply(console, arguments)
  // output: `null, 1, 2, 3`
})
```

**v4.x:**
```js
thunk(function (done) {
  done(null, 1, 2, 3)
})(function (error, res) {
  console.log.apply(console, arguments)
  // output: `null, [1, 2, 3]`
})
```

if there is a `error`, the arguments will be explicitly `error`, otherwise the `error` will always be `null`(In all version).

## Installation

**Node.js:**

    npm install thunks

**Bower:**

    bower install thunks

**browser:**

```html
<script src="/pathTo/thunks.js"></script>
```

## API

```js
var thunks = require('thunks')
```

### thunks([options])

Matrix of `thunk`, it generates a `thunk` generator function with it's scope.
"scope" refers to the running evironments `thunk` generated(directly or indirectly) for all child thunk functions.

1. Here's how you create a basic `thunk`, any exceptions would be passed the next child thunk function:

  ```js
  var thunk = thunks()
  ```

2. Here's the way to create a `thunk` listening to all exceptions in current scope with `onerror`,
and it will make sure the exeptions not being passed to the followed child thunk function, unless `onerror` function return `true`.

  ```js
  var thunk = thunks(function (error) { console.error(error) })
  ```

3. Create a `thunk` with `onerror`, `onstop` and `debug` listeners.
Results of this `thunk` would be passed to `debug` function first before passing to the followed child thunk function.

  ```js
  var thunk = thunks({
    onstop: function (sig) { console.log(sig) },
    onerror: function (error) { console.error(error) },
    debug: function () { console.log.apply(console, arguments) }
  })
  ```

Even multiple `thunk` main functions with diferent scope are composed,
each scope would be seperated from each other,
which means, `onerror`, `onstop` and `debug` would not run in other scopes.

### thunk(thunkable)

This is the main function, named `thunk generator`, to create new child thunk functions.

The parameter `thunkable` value could be:

1. a child thunk function, by calling this function a new child thunk function will be returned

  ```js
  var thunk1 = thunk(1)
  var thunk2 = thunk(thunk1) // thunk2 equals to thunk1
  ```

2. `function (callback) {}`, by calling it, results woule be gathered and be passed to the next child thunk function

  ```js
  thunk(function (callback) {
    callback(null, 1)
  })(function (error, value) {
    console.log(error, value) // null 1
  })
  ```

3. a Promise object, results of Promise would be passed to a new child thunk function

  ```js
  var promise = Promise.resolve(1)

  thunk(promise)(function (error, value) {
    console.log(error, value) // null 1
  })
  ```

4. objects which implements methods of `toThunk`

  ```js
  var then = Thenjs(1) // then.toThunk() return a thunk function

  thunk(then)(function (error, value) {
    console.log(error, value) // null 1
  })
  ```

5. Generator and Generator Function, like `co`, but `yield` anything

  ```js
  thunk(function *() {
    var x = yield 10
    return 2 * x
  })(function *(error, res) {
    console.log(error, res) // null, 20

    return yield thunk.all([1, 2, thunk(3)])
  })(function *(error, res) {
    console.log(error, res) // null, [1, 2, 3]
    return yield thunk.all({
      name: 'test',
      value: thunk(1)
    })
  })(function (error, res) {
    console.log(error, res) // null, {name: 'test', value: 1}
  })
  ```

6. values in other types would be valid results passing to a new child thunk function

  ```js
  thunk(1)(function (error, value) {
    console.log(error, value) // null 1
  })

  thunk([1, 2, 3])(function (error, value) {
    console.log(error, value) // null [1, 2, 3]
  })
  ```

You can also run with `this`:

  ```js
  thunk.call({x: 123}, 456)(function (error, value) {
    console.log(error, this.x, value) // null 123 456
    return 'thunk!'
  })(function (error, value) {
    console.log(error, this.x, value) // null 123 'thunk!'
  })
  ```

### thunk.all(obj)
### thunk.all(thunkable1, ..., thunkableN)

Returns a child thunk function.

`obj` can be an array or an object that contains any value. `thunk.all` will transform value to a child thunk function and excuted it in parallel. After all of them are finished, an array containing results(in its original order) would be passed to the a new child thunk function.

```js
thunk.all([
  thunk(0),
  function *() { return yield 1 },
  2,
  thunk(function (callback) { callback(null, [3]) })
])(function (error, value) {
  console.log(error, value) // null [0, 1, 2, [3]]
})

thunk.all({
  a: thunk(0),
  b: thunk(1),
  c: 2,
  d: thunk(function (callback) { callback(null, [3]) })
})(function (error, value) {
  console.log(error, value) // null {a: 0, b: 1, c: 2, d: [3]}
})
```

You may also write code like this:

```js
thunk.all.call({x: [1, 2, 3]}, [4, 5, 6])(function (error, value) {
  console.log(error, this.x, value) // null [1, 2, 3] [4, 5, 6]
  return 'thunk!'
})(function (error, value) {
  console.log(error, this.x, value) // null [1, 2, 3] 'thunk!'
})
```

### thunk.seq([thunkable1, ..., thunkableN])
### thunk.seq(thunkable1, ..., thunkableN)

Returns a child thunk function.

`thunkX` can be any value, `thunk.seq` will transform value to a child thunk function and excuted it in order. After all of them are finished, an array containing results(in its original order) would be passed to the a new child thunk function.

```js
thunk.seq([
  function (callback) {
    setTimeout(function () {
      callback(null, 'a', 'b')
    }, 100)
  },
  thunk(function (callback) {
    callback(null, 'c')
  }),
  [thunk('d'), function *() { return yield 'e' }], // thunk in array will be excuted in parallel
  function (callback) {
    should(flag).be.eql([true, true])
    flag[2] = true
    callback(null, 'f')
  }
])(function (error, value) {
  console.log(error, value) // null [['a', 'b'], 'c', ['d', 'e'], 'f']
})
```
or

```js
thunk.seq(
  function (callback) {
    setTimeout(function () {
      callback(null, 'a', 'b')
    }, 100)
  },
  thunk(function (callback) {
    callback(null, 'c')
  }),
  [thunk('d'), thunk('e')], // thunk in array will be excuted in parallel
  function (callback) {
    should(flag).be.eql([true, true])
    flag[2] = true
    callback(null, 'f')
  }
)(function (error, value) {
  console.log(error, value) // null [['a', 'b'], 'c', ['d', 'e'], 'f']
})
```

You may also write code like this:

```js
thunk.seq.call({x: [1, 2, 3]}, 4, 5, 6)(function (error, value) {
  console.log(error, this.x, value) // null [1, 2, 3] [4, 5, 6]
  return 'thunk!'
})(function (error, value) {
  console.log(error, this.x, value) // null [1, 2, 3] 'thunk!'
})
```

### thunk.race([thunkable1, ..., thunkableN])
### thunk.race(thunkable1, ..., thunkableN)

Returns a child thunk function with the value or error from one first completed.

### thunk.thunkify(fn)

Returns a new function that would return a child thunk function

Transform a `fn` function which is in Node.js style into a new function.
This new function does not accept `callback` as arguments, but accepts child thunk functions.

```js
var thunk = require('thunks')()
var fs = require('fs')
var fsStat = thunk.thunkify(fs.stat)

fsStat('thunks.js')(function (error, result) {
  console.log('thunks.js: ', result)
})
fsStat('.gitignore')(function (error, result) {
  console.log('.gitignore: ', result)
})
```

You may also write code with `this`:

```js
var obj = {a: 8}
function run (x, callback) {
  //...
  callback(null, this.a * x)
}

var run = thunk.thunkify.call(obj, run)

run(1)(function (error, result) {
  console.log('run 1: ', result)
})
run(2)(function (error, result) {
  console.log('run 2: ', result)
})
```

### thunk.lift(fn)

`lift` comes from Haskell, it transform a sync function `fn` into a new async  function.
This new function will accept `thunkable` arguments, evaluate them, then run as the original function `fn`. The new function return a child thunk function.

```js
var thunk = require('thunks')()

function calculator (a, b, c) {
  return (a + b + c) * 10
}

var calculatorT = thunk.lift(calculator)

var value1 = thunk(2)
var value2 = Promise.resolve(3)

calculatorT(value1, value2, 5)(function (error, result) {
  console.log(result) // 100
})
```

You may also write code with `this`:

```js
var calculatorT = thunk.lift.call(context, calculator)
```

### thunk.persist(thunkable)

it transform `thunkable` value to a persist thunk function, which can be called more than once with the same result(like as promise). The new function return a child thunk function.

```js
var thunk = require('thunks')()

var persistThunk = thunk.persist(thunk(x))

persistThunk(function (error, result) {
  console.log(1, result) // x
  return persistThunk(function (error, result) {
    console.log(2, result) // x
    return persistThunk
  })
})(function (error, result) {
  console.log(3, result) // x
})
```

You may also write code with `this`:

```js
var persistThunk = thunk.persist.call(context, thunkable)
```

### thunk.delay(delay)

Return a child thunk function, this child thunk function will be called after `delay` milliseconds.

```js
console.log('thunk.delay 500: ', Date.now())
thunk.delay(500)(function () {
  console.log('thunk.delay 1000: ', Date.now())
  return thunk.delay(1000)
})(function () {
  console.log('thunk.delay end: ', Date.now())
})
```

You may also write code with `this`:

```js
console.log('thunk.delay start: ', Date.now())
thunk.delay.call(this, 1000)(function () {
  console.log('thunk.delay end: ', Date.now())
})
```

### thunk.stop([messagge])

This will stop control flow process with a message similar to Promise's cancelable(not implement yet). It will throw a stop signal object.
Stop signal is a object with a message and `status === 19`(POSIX signal SIGSTOP) and a special code. Stop signal can be caught by `onstop`, and aslo can be caught by `try catch`, in this case it will not trigger `onstop`.

```js
var thunk = require('thunks')({
  onstop: function (res) {
    if (res) console.log(res.code, res.status, res) // SIGSTOP 19 { message: 'Stop now!' }
  }
})

thunk(function (callback) {
  thunk.stop('Stop now!')
  console.log('It will not run!')
})(function (error, value) {
  console.log('It will not run!', error)
})
```

```js
thunk.delay(100)(function () {
  console.log('Hello')
  return thunk.delay(100)(function () {
    thunk.stop('Stop now!')
    console.log('It will not run!')
  })
})(function (error, value) {
  console.log('It will not run!')
})
```

[npm-url]: https://npmjs.org/package/thunks
[npm-image]: http://img.shields.io/npm/v/thunks.svg

[travis-url]: https://travis-ci.org/thunks/thunks
[travis-image]: http://img.shields.io/travis/thunks/thunks.svg

[coveralls-url]: https://coveralls.io/r/thunks/thunks
[coveralls-image]: https://coveralls.io/repos/thunks/thunks/badge.svg

[downloads-url]: https://npmjs.org/package/thunks
[downloads-image]: http://img.shields.io/npm/dm/thunks.svg?style=flat-square

[js-standard-url]: https://github.com/feross/standard
[js-standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
