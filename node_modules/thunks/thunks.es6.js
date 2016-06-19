'use strict'
// **Github:** https://github.com/thunks/thunks
//
// **License:** MIT

const maxTickDepth = 100
/* istanbul ignore next */
const nextTick = (typeof process === 'object' && process.nextTick)
  ? process.nextTick : typeof setImmediate === 'function'
  ? setImmediate : (fn) => setTimeout(fn, 0)

function thunks (options) {
  const scope = Domain.prototype.scope = new Scope(options)

  function Domain (ctx) {
    this.ctx = ctx
  }

  function thunk (thunkable) {
    return childThunk(new Link([null, thunkable], null), new Domain(this === thunk ? null : this))
  }

  thunk.all = function (obj) {
    if (arguments.length > 1) obj = slice(arguments)
    return thunk.call(this, objectToThunk(obj, true))
  }

  thunk.seq = function (array) {
    if (arguments.length > 1) array = slice(arguments)
    return thunk.call(this, sequenceToThunk(array))
  }

  thunk.race = function (array) {
    if (arguments.length > 1) array = slice(arguments)
    return thunk.call(this, function (done) {
      if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
      if (!array.length) return thunk.call(this)(done)
      for (let i = 0, l = array.length; i < l; i++) thunk.call(this, array[i])(done)
    })
  }

  thunk.digest = function () {
    let args = slice(arguments)
    return thunk.call(this, function (callback) {
      return apply(null, callback, args)
    })
  }

  thunk.thunkify = function (fn) {
    let ctx = this === thunk ? null : this
    return function () {
      let args = slice(arguments)
      return thunk.call(ctx || this, function (callback) {
        args.push(callback)
        return apply(this, fn, args)
      })
    }
  }

  thunk.lift = function (fn) {
    let ctx = this === thunk ? null : this
    return function () {
      return thunk.call(ctx || this, objectToThunk(slice(arguments), false))(function (err, res) {
        if (err != null) throw err
        return apply(this, fn, res)
      })
    }
  }

  thunk.delay = function (delay) {
    return thunk.call(this, function (callback) {
      return delay > 0 ? setTimeout(callback, delay) : nextTick(callback)
    })
  }

  thunk.stop = function (message) {
    let signal = new SigStop(message)
    nextTick(() => scope.onstop && scope.onstop.call(null, signal))
    throw signal
  }

  thunk.persist = function (thunkable) {
    let ctx = this === thunk ? null : this
    let result
    let queue = []

    thunk.call(ctx, thunkable)(function () {
      result = slice(arguments)
      while (queue.length) apply(null, queue.shift(), result)
    })

    return function (callback) {
      return thunk.call(ctx || this, (done) => {
        if (result) return apply(null, done, result)
        else queue.push(done)
      })(callback)
    }
  }

  return thunk
}

function Scope (options) {
  this.onerror = this.onstop = this.debug = null
  if (isFunction(options)) this.onerror = options
  else if (options) {
    if (isFunction(options.onerror)) this.onerror = options.onerror
    if (isFunction(options.onstop)) this.onstop = options.onstop
    if (isFunction(options.debug)) this.debug = options.debug
  }
}

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
  return function (callback) {
    return child(parent, domain, callback)
  }
}

function child (parent, domain, callback) {
  if (parent.callback) throw new Error('The thunk already filled')
  if (callback && !isFunction(callback)) throw new TypeError(String(callback) + ' is not a function')
  parent.callback = callback || noOp
  if (parent.result) continuation(parent, domain)
  return childThunk(parent.next, domain)
}

function continuation (parent, domain, tickDepth) {
  let current = parent.next
  let scope = domain.scope
  let result = parent.result
  return result[0] != null ? callback(result[0]) : runThunk(domain.ctx, result[1], callback)

  function callback (err) {
    if (parent.result === null) return
    parent.result = null
    if (scope.debug) apply(null, scope.debug, arguments)

    let args = [err]
    if (err != null) {
      pruneErrorStack(err)
      if (err instanceof SigStop) return
      if (scope.onerror) {
        if (scope.onerror.call(null, err) !== true) return
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
      if (--tickDepth) return continuation(current, domain, tickDepth)
      return nextTick(() => continuation(current, domain, 0))
    }
    if (current.result[0] != null) {
      nextTick(() => {
        if (!current.result) return
        if (scope.onerror) return scope.onerror.call(null, current.result[0])
        /* istanbul ignore next */
        noOp(current.result[0])
      })
    }
  }
}

function runThunk (ctx, value, callback, thunkObj, noTryRun) {
  let thunk = toThunk(value, thunkObj)
  if (!isFunction(thunk)) return thunk === undefined ? callback(null) : callback(null, thunk)
  if (isGeneratorFunction(thunk)) thunk = generatorToThunk(thunk.call(ctx))
  else if (thunk.length !== 1) {
    if (!thunks.strictMode) return callback(null, thunk)
    let err = new Error('Not thunk function: ' + thunk)
    err.fn = thunk
    return callback(err)
  }
  if (noTryRun) return thunk.call(ctx, callback)
  let err = tryRun(ctx, thunk, [callback])[0]
  return err && callback(err)
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

function toThunk (obj, thunkObj) {
  if (!obj || isFunction(obj)) return obj
  if (isGenerator(obj)) return generatorToThunk(obj)
  if (isFunction(obj.toThunk)) return obj.toThunk()
  if (isFunction(obj.then)) return promiseToThunk(obj)
  if (thunkObj && (Array.isArray(obj) || isObject(obj))) return objectToThunk(obj, thunkObj)
  return obj
}

function generatorToThunk (gen) {
  return function (callback) {
    let ctx = this
    let tickDepth = maxTickDepth
    return run()

    function run (err, res) {
      if (err instanceof SigStop) return callback(err)
      let ret = err == null ? gen.next(res) : gen.throw(err)
      if (ret.done) return runThunk(ctx, ret.value, callback)
      if (--tickDepth) return runThunk(ctx, ret.value, next, true)
      return nextTick(() => {
        tickDepth = maxTickDepth
        return runThunk(ctx, ret.value, next, true)
      })
    }

    function next (err, res) {
      try {
        return run(err, arguments.length > 2 ? slice(arguments, 1) : res)
      } catch (error) {
        return callback(error)
      }
    }
  }
}

function objectToThunk (obj, thunkObj) {
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
    return --pending || callback(null, result)

    function next (fn, index) {
      if (finished) return
      ++pending
      runThunk(ctx, fn, function (err, res) {
        if (finished) return
        if (err != null) {
          finished = true
          return callback(err)
        }
        result[index] = arguments.length > 2 ? slice(arguments, 1) : res
        return --pending || callback(null, result)
      }, thunkObj, true)
    }
  }
}

function sequenceToThunk (array) {
  return function (callback) {
    if (!Array.isArray(array)) throw new TypeError(String(array) + ' is not array')
    let ctx = this
    let i = 0
    let end = array.length - 1
    let tickDepth = maxTickDepth
    let result = Array(array.length)
    return end < 0 ? callback(null, result) : runThunk(ctx, array[0], next, true)

    function next (err, res) {
      if (err != null) return callback(err)
      result[i] = arguments.length > 2 ? slice(arguments, 1) : res
      if (++i > end) return callback(null, result)
      if (--tickDepth) return runThunk(ctx, array[i], next, true)
      nextTick(() => {
        tickDepth = maxTickDepth
        runThunk(ctx, array[i], next, true)
      })
    }
  }
}

function promiseToThunk (promise) {
  return function (callback) {
    return promise.then(function (res) {
      callback(null, res)
    }, callback)
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
  return isFunction(obj.next) && isFunction(obj.throw)
}

function isGeneratorFunction (fn) {
  return fn.constructor.name === 'GeneratorFunction'
}

function noOp (error) {
  if (error == null) return
  /* istanbul ignore next */
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
thunks.VERSION = '4.2.1'
thunks.strictMode = true
thunks.pruneErrorStack = true
export default thunks
