## 0.7.4

## Bug Fixes

* Fix memory leak during parameter passing. (@mnahkies)

## 0.7.3

### Compatibility

* Support for Node 6.0.0.

## 0.7.1

### Bug Fixes

* Green tests by allowing normal exit after `.terminate()`
* Do not reuse threads after `.terminate()`; fixed #62.

## 0.6.3

### Bug Fixes

* `.terminate()` now destroys thread immediately (@yufeih)

## 0.6.2

### Compatibility

* Restored support for Node 0.10.40 (@smith-kyle)

## 0.6.1

### Bug Fixes

* Fix crash on Node 4.x in the case of `pool.any.eval('undefined_function()')` (@brodybits)

## 0.6.0

### Compatibility

* Support for Node 4.x (@brodybits)
* Remove support for Node 0.8.x

## 0.5.7

### Compatibility

* Support for io.js-3.3.1. (@marcominetti)

## 0.5.6

### Compatibility

* Support for io.js-1.0.x/2.0.0. (@heavyk)

## 0.5.5

### Compatibility

* Proper support for Node 0.11.x. (@caasi, @senditu, @gitawego)

## 0.4.11

* Correct a typo in `examples/ex05_pool.js`. (@naderchehab)

## 0.4.10

### Bug Fixes

* Fix `pool.any.emit`. (@craigwinstanley, Jason Winshell)

## 0.4.9

### Bug Fixes

* Fix compilation on Node 0.8.x (@RemcoTukker).
* Upgrade LiveScript in devDependencies; no functional changes.

## 0.4.8

### Bug Fixes

* Fix compilation with V8 3.20.x.

## 0.4.7

### Worker API

* Errors during @postMessage are caught and raised in `onerror` handler, as per spec.

## 0.4.6

### Bug Fixes

* Compatibility with Node.js 0.10.

## 0.4.5

### Bug Fixes

* new Worker("filename.js") was broken on OS X. (@dfellis)

## 0.4.3

### Bug Fixes

* Fix Linux compilation issue introduced in 0.4.1. (@dfellis)

* `importScripts` now checks if the files have been read entirely,
  instead of (potentially) evaluating part of the file in case
  of filesystem failure.

## 0.4.2

### Global Worker API

* Set `onmessage = function(event) { ... }` directly now works
  as specced. (Previously it required `self.onmessage = ...`.)

## 0.4.1

### Global Worker API

* Add `importScripts` for loading on-disk files.

* Add `console.log` and `console.error` from thread.js.

## 0.4.0

* Support for Windows with Node.js 0.9.3+.

## 0.3.2

* Fix BSON building on SunOS.

## 0.3.1

* Switch to BSON instead of JSON for message serialization.

  Note that neither one supports circular structures or
  native buffer objects yet.

## 0.3.0

* Require Node.js 0.8.

## 0.2.3

* Add SunOS to supported OSs; tested on Linux.

## 0.2.2

* Allow an empty `new Worker()` constructor.

* Update API documentation in README.

## 0.2.1

* Allow any JSON-serializable structures in postMessage/onmessage.

## 0.2.0

* Initial release.
