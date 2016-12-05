'use strict'
// **Github:** https://github.com/thunks/thunks
//
// **License:** MIT

const maxTickDepth = 100
const $setTimeout = setTimeout
/* istanbul ignore next */
const nextTick = typeof setImmediate === 'function'
  ? setImmediate : typeof Promise === 'function'
  ? function (fn) { Promise.resolve().then(fn) } : function (fn) { $setTimeout(fn, 0) }

function thunks (options) {
  const scope = options instanceof Scope ? options : new Scope(options)
  Domain.prototype.scope = scope

  function Domain (ctx) {
    this.ctx = ctx
  }

  function thunk (thunkable) {
    return childThunk(new Link([null, thunkable], null),
                      new Domain(this === thunk ? null : this))
  }

  thunk.all = function (obj) {
    if (arguments.length > 1) obj = slice(arguments)
    return thunk.call(this, objectToThunk(obj, scope, true))
  }

  thunk.seq = function (array) {
    if (arguments.length > 1) array = slice(arguments)
    return thunk.call(this, sequenceToThunk(array, scope))
  }

  thunk.race = function (array) {
    if (arguments.length > 1) array = slice(arguments)
    return thunk.call(this, function (done) {
      if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
      for (let fn of array) thunk.call(this, fn)(done)
      if (!array.length) thunk.call(this)(done)
    })
  }

  thunk.thunkify = function (fn) {
    let ctx = this === thunk ? null : this
    return function () {
      let args = slice(arguments)
      return thunk.call(ctx || this, function (callback) {
        args.push(callback)
        apply(this, fn, args)
      })
    }
  }

  thunk.lift = function (fn) {
    let ctx = this === thunk ? null : this
    return function () {
      let thunkable = objectToThunk(slice(arguments), scope, false)
      return thunk.call(ctx || this, thunkable)(function (err, res) {
        if (err != null) throw err
        return apply(this, fn, res)
      })
    }
  }

  thunk.delay = function (delay) {
    return thunk.call(this, function (callback) {
      if (delay > 0) $setTimeout(callback, delay)
      else nextTick(callback)
    })
  }

  thunk.stop = function (message) {
    let signal = new SigStop(message)
    nextTick(() => scope.onstop && scope.onstop(signal))
    throw signal
  }

  thunk.cancel = function () {
    scope.canceled = true
  }

  thunk.persist = function (thunkable) {
    let result
    let queue = []
    let ctx = this === thunk ? null : this

    thunk.call(ctx, thunkable)(function () {
      result = slice(arguments)
      while (queue.length) apply(null, queue.shift(), result)
    })

    return function (callback) {
      return thunk.call(ctx || this, function (done) {
        if (result) apply(null, done, result)
        else queue.push(done)
      })(callback)
    }
  }

  return thunk
}

function Scope (options) {
  this.canceled = false
  if (isFunction(options)) this.onerror = options
  else if (options) {
    if (isFunction(options.onerror)) this.onerror = options.onerror
    if (isFunction(options.onstop)) this.onstop = options.onstop
    if (isFunction(options.debug)) this.debug = options.debug
  }
}
Scope.prototype.debug = null
Scope.prototype.onstop = null
Scope.prototype.onerror = null

function Link (result, callback) {
  this.next = null
  this.result = result
  this.callback = callback
}

function SigStop (message) {
  this.message = String(message == null ? 'process stopped' : message)
}
SigStop.prototype.status = 19
SigStop.prototype.code = 'SIGSTOP'

function childThunk (parent, domain) {
  parent.next = new Link(null, null)
  return function thunkFunction (callback) {
    return child(parent, domain, callback)
  }
}

function child (parent, domain, callback) {
  if (parent.callback) throw new Error('The thunkFunction already filled')
  if (callback && !isFunction(callback)) {
    throw new TypeError(String(callback) + ' is not a function')
  }
  parent.callback = callback || noOp
  if (parent.result) continuation(parent, domain)
  return childThunk(parent.next, domain)
}

function continuation (parent, domain, tickDepth) {
  let current = parent.next
  let scope = domain.scope
  let result = parent.result
  if (result[0] != null) callback(result[0])
  else runThunk(scope, domain.ctx, result[1], callback)

  function callback (err) {
    if (scope.canceled || parent.result === null) return
    parent.result = null
    if (scope.debug) apply(scope, scope.debug, arguments)

    let args = [err]
    if (err != null) {
      pruneErrorStack(err)
      if (err instanceof SigStop) return
      if (scope.onerror) {
        if (scope.onerror(err) !== true) return
        // if onerror return true then continue
        args[0] = null
      }
    } else {
      args[0] = null
      // transform two or more results to a array of results
      if (arguments.length === 2) args.push(arguments[1])
      else if (arguments.length > 2) args.push(slice(arguments, 1))
    }

    current.result = tryRun(domain.ctx, parent.callback, args)
    if (current.callback) {
      tickDepth = tickDepth || maxTickDepth
      if (--tickDepth) continuation(current, domain, tickDepth)
      else nextTick(() => continuation(current, domain, 0))
    } else if (current.result[0] != null) {
      nextTick(() => {
        if (!current.result) return
        if (scope.onerror) scope.onerror(current.result[0])
        else noOp(current.result[0])
      })
    }
  }
}

function runThunk (scope, ctx, value, callback, thunkObj, noTryRun) {
  let thunk = toThunk(value, scope, thunkObj)
  if (!isFunction(thunk)) {
    return thunk === undefined ? callback(null) : callback(null, thunk)
  }
  if (isGeneratorFn(thunk)) {
    if (thunk.length) return callback(new Error('Not thunkable function: ' + thunk.toString()))
    thunk = generatorToThunk(thunk.call(ctx), scope)
  } else if (isAsyncFn(thunk)) {
    if (thunk.length) return callback(new Error('Not thunkable function: ' + thunk.toString()))
    thunk = promiseToThunk(thunk.call(ctx))
  } else if (thunk.length !== 1) {
    return callback(new Error('Not thunkable function: ' + thunk.toString()))
  }
  if (noTryRun) return thunk.call(ctx, callback)
  let err = tryRun(ctx, thunk, [callback])[0]
  if (err) callback(err)
}

function tryRun (ctx, fn, args) {
  let result = [null, null]
  try {
    result[1] = apply(ctx, fn, args)
  } catch (err) {
    result[0] = err
  }
  return result
}

function toThunk (obj, scope, thunkObj) {
  if (!obj || isFunction(obj)) return obj
  if (isGenerator(obj)) return generatorToThunk(obj, scope)
  if (isFunction(obj.toThunk)) return obj.toThunk()
  if (isFunction(obj.then)) return promiseToThunk(obj)
  if (isFunction(obj.toPromise)) return promiseToThunk(obj.toPromise())
  if (thunkObj && (Array.isArray(obj) || isObject(obj))) return objectToThunk(obj, scope, thunkObj)
  return obj
}

function generatorToThunk (gen, scope) {
  return function (callback) {
    let ctx = this
    let tickDepth = maxTickDepth
    runGenerator()

    function runGenerator (err, res) {
      if (scope.canceled) return
      if (err instanceof SigStop) return callback(err)
      let ret = err == null ? gen.next(res) : gen.throw(err)
      if (ret.done) return runThunk(scope, ctx, ret.value, callback)
      if (--tickDepth) return runThunk(scope, ctx, ret.value, next, true)
      nextTick(() => {
        tickDepth = maxTickDepth
        runThunk(scope, ctx, ret.value, next, true)
      })
    }

    function next (err, res) {
      try {
        runGenerator(err, arguments.length > 2 ? slice(arguments, 1) : res)
      } catch (error) {
        callback(error)
      }
    }
  }
}

function objectToThunk (obj, scope, thunkObj) {
  return function (callback) {
    let ctx = this
    let i = 0
    let len = 0
    let result
    let pending = 1
    let finished = false

    if (Array.isArray(obj)) {
      result = Array(obj.length)
      for (len = obj.length; i < len; i++) next(obj[i], i)
    } else if (isObject(obj)) {
      result = {}
      let keys = Object.keys(obj)
      for (len = keys.length; i < len; i++) next(obj[keys[i]], keys[i])
    } else throw new Error('Not array or object')
    if (!--pending) callback(null, result)

    function next (fn, index) {
      if (finished) return
      ++pending
      runThunk(scope, ctx, fn, function (err, res) {
        if (scope.canceled || finished) return
        if (err != null) {
          finished = true
          return callback(err)
        }
        result[index] = arguments.length > 2 ? slice(arguments, 1) : res
        if (!--pending) callback(null, result)
      }, thunkObj, true)
    }
  }
}

function sequenceToThunk (array, scope) {
  return function (callback) {
    if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
    let ctx = this
    let i = 0
    let end = array.length - 1
    let tickDepth = maxTickDepth
    let result = Array(array.length)
    return end < 0 ? callback(null, result) : runThunk(scope, ctx, array[0], next, true)

    function next (err, res) {
      if (scope.canceled) return
      if (err != null) return callback(err)
      result[i] = arguments.length > 2 ? slice(arguments, 1) : res
      if (++i > end) return callback(null, result)
      if (--tickDepth) return runThunk(scope, ctx, array[i], next, true)
      nextTick(() => {
        tickDepth = maxTickDepth
        runThunk(scope, ctx, array[i], next, true)
      })
    }
  }
}

function promiseToThunk (promise) {
  return function (callback) {
    promise.then(function (res) {
      callback(null, res)
    }, function (err) {
      if (err == null) err = new Error('unknown error: ' + err)
      callback(err)
    })
  }
}

// fast slice for `arguments`.
function slice (args, start) {
  let len = args.length
  start = start || 0
  if (start >= len) return []

  let ret = Array(len - start)
  while (len-- > start) ret[len - start] = args[len]
  return ret
}

function apply (ctx, fn, args) {
  if (args.length === 2) return fn.call(ctx, args[0], args[1])
  if (args.length === 1) return fn.call(ctx, args[0])
  return fn.apply(ctx, args)
}

function isObject (obj) {
  return obj && obj.constructor === Object
}

function isFunction (fn) {
  return typeof fn === 'function'
}

function isGenerator (obj) {
  return obj.constructor && isGeneratorFn(obj.constructor)
}

function isGeneratorFn (fn) {
  return fn.constructor && fn.constructor.name === 'GeneratorFunction'
}

function isAsyncFn (fn) {
  return fn.constructor && fn.constructor.name === 'AsyncFunction'
}

function noOp (error) {
  if (error == null) return
  error = pruneErrorStack(error)
  nextTick(() => {
    if (isFunction(thunks.onerror)) thunks.onerror(error)
    else throw error
  })
}

function pruneErrorStack (error) {
  if (thunks.pruneErrorStack && error.stack) {
    error.stack = error.stack.replace(/^\s*at.*thunks\.js.*$/gm, '').replace(/\n+/g, '\n')
  }
  return error
}

thunks.NAME = 'thunks'
thunks.VERSION = '4.7.5'
thunks.Scope = Scope
thunks.thunk = thunks()
thunks.thunks = thunks
thunks.pruneErrorStack = true
thunks.isGeneratorFn = (fn) => isFunction(fn) && isGeneratorFn(fn)
thunks.isAsyncFn = (fn) => isFunction(fn) && isAsyncFn(fn)
thunks.isThunkableFn = (fn) => {
  return isFunction(fn) && (fn.length === 1 || isAsyncFn(fn) || isGeneratorFn(fn))
}

export default thunks
