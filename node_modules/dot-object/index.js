'use strict'

function _process (v, mod) {
  var i
  var r

  if (typeof mod === 'function') {
    r = mod(v)
    if (r !== undefined) {
      v = r
    }
  } else if (Array.isArray(mod)) {
    for (i = 0; i < mod.length; i++) {
      r = mod[i](v)
      if (r !== undefined) {
        v = r
      }
    }
  }

  return v
}

function parseKey (key, val) {
  // detect negative index notation
  if (key[0] === '-' && Array.isArray(val) && /^-\d+$/.test(key)) {
    return val.length + parseInt(key, 10)
  }
  return key
}

function isIndex (k) {
  return /^\d+/.test(k)
}

function parsePath (path, sep) {
  if (path.indexOf('[') >= 0) {
    path = path.replace(/\[/g, '.').replace(/]/g, '')
  }
  return path.split(sep)
}

function DotObject (seperator, override, useArray) {
  if (!(this instanceof DotObject)) {
    return new DotObject(seperator, override, useArray)
  }

  if (typeof seperator === 'undefined') seperator = '.'
  if (typeof override === 'undefined') override = false
  if (typeof useArray === 'undefined') useArray = true
  this.seperator = seperator
  this.override = override
  this.useArray = useArray

  // contains touched arrays
  this.cleanup = []
}

var dotDefault = new DotObject('.', false, true)
function wrap (method) {
  return function () {
    return dotDefault[method].apply(dotDefault, arguments)
  }
}

DotObject.prototype._fill = function (a, obj, v, mod) {
  var k = a.shift()

  if (a.length > 0) {
    obj[k] = obj[k] ||
      (this.useArray && isIndex(a[0]) ? [] : {})

    if (obj[k] !== Object(obj[k])) {
      if (this.override) {
        obj[k] = {}
      } else {
        throw new Error(
          'Trying to redefine `' + k + '` which is a ' + typeof obj[k]
        )
      }
    }

    this._fill(a, obj[k], v, mod)
  } else {
    if (!this.override &&
      obj[k] === Object(obj[k]) && Object.keys(obj[k]).length) {
      throw new Error("Trying to redefine non-empty obj['" + k + "']")
    }

    obj[k] = _process(v, mod)
  }
}

/**
 *
 * Converts an object with dotted-key/value pairs to it's expanded version
 *
 * Optionally transformed by a set of modifiers.
 *
 * Usage:
 *
 *   var row = {
 *     'nr': 200,
 *     'doc.name': '  My Document  '
 *   }
 *
 *   var mods = {
 *     'doc.name': [_s.trim, _s.underscored]
 *   }
 *
 *   dot.object(row, mods)
 *
 * @param {Object} obj
 * @param {Object} mods
 */
DotObject.prototype.object = function (obj, mods) {
  var self = this

  Object.keys(obj).forEach(function (k) {
    var mod = mods === undefined ? null : mods[k]
    // normalize array notation.
    var ok = parsePath(k, self.seperator).join(self.seperator)

    if (ok.indexOf(self.seperator) !== -1) {
      self._fill(ok.split(self.seperator), obj, obj[k], mod)
      delete obj[k]
    } else if (self.override) {
      obj[k] = _process(obj[k], mod)
    }
  })

  return obj
}

/**
 * @param {String} path dotted path
 * @param {String} v value to be set
 * @param {Object} obj object to be modified
 * @param {Function|Array} mod optional modifier
 */
DotObject.prototype.str = function (path, v, obj, mod) {
  if (path.indexOf(this.seperator) !== -1) {
    this._fill(path.split(this.seperator), obj, v, mod)
  } else if (this.override) {
    obj[path] = _process(v, mod)
  }

  return obj
}

/**
 *
 * Pick a value from an object using dot notation.
 *
 * Optionally remove the value
 *
 * @param {String} path
 * @param {Object} obj
 * @param {Boolean} remove
 */
DotObject.prototype.pick = function (path, obj, remove) {
  var i
  var keys
  var val
  var key
  var cp

  keys = parsePath(path, this.seperator)
  for (i = 0; i < keys.length; i++) {
    key = parseKey(keys[i], obj)
    if (obj && typeof obj === 'object' && key in obj) {
      if (i === (keys.length - 1)) {
        if (remove) {
          val = obj[key]
          delete obj[key]
          if (Array.isArray(obj)) {
            cp = keys.slice(0, -1).join('.')
            if (this.cleanup.indexOf(cp) === -1) {
              this.cleanup.push(cp)
            }
          }
          return val
        } else {
          return obj[key]
        }
      } else {
        obj = obj[key]
      }
    } else {
      return undefined
    }
  }
  if (remove && Array.isArray(obj)) {
    obj = obj.filter(function (n) { return n !== undefined })
  }
  return obj
}

/**
 *
 * Remove value from an object using dot notation.
 *
 * @param {String} path
 * @param {Object} obj
 * @return {Mixed} The removed value
 */
DotObject.prototype.remove = function (path, obj) {
  var i

  this.cleanup = []
  if (Array.isArray(path)) {
    for (i = 0; i < path.length; i++) {
      this.pick(path[i], obj, true)
    }
    this._cleanup(obj)
    return obj
  } else {
    return this.pick(path, obj, true)
  }
}

DotObject.prototype._cleanup = function (obj) {
  var ret
  var i
  var keys
  var root
  if (this.cleanup.length) {
    for (i = 0; i < this.cleanup.length; i++) {
      keys = this.cleanup[i].split('.')
      root = keys.splice(0, -1).join('.')
      ret = root ? this.pick(root, obj) : obj
      ret = ret[keys[0]].filter(function (v) { return v !== undefined })
      this.set(this.cleanup[i], ret, obj)
    }
    this.cleanup = []
  }
}

// alias method
DotObject.prototype.del = DotObject.prototype.remove

/**
 *
 * Move a property from one place to the other.
 *
 * If the source path does not exist (undefined)
 * the target property will not be set.
 *
 * @param {String} source
 * @param {String} target
 * @param {Object} obj
 * @param {Function|Array} mods
 * @param {Boolean} merge
 */
DotObject.prototype.move = function (source, target, obj, mods, merge) {
  if (typeof mods === 'function' || Array.isArray(mods)) {
    this.set(target, _process(this.pick(source, obj, true), mods), obj, merge)
  } else {
    merge = mods
    this.set(target, this.pick(source, obj, true), obj, merge)
  }

  return obj
}

/**
 *
 * Transfer a property from one object to another object.
 *
 * If the source path does not exist (undefined)
 * the property on the other object will not be set.
 *
 * @param {String} source
 * @param {String} target
 * @param {Object} obj1
 * @param {Object} obj2
 * @param {Function|Array} mods
 * @param {Boolean} merge
 */
DotObject.prototype.transfer = function (source, target, obj1, obj2, mods, merge) {
  if (typeof mods === 'function' || Array.isArray(mods)) {
    this.set(target,
      _process(
        this.pick(source, obj1, true),
        mods
      ), obj2, merge)
  } else {
    merge = mods
    this.set(target, this.pick(source, obj1, true), obj2, merge)
  }

  return obj2
}

/**
 *
 * Copy a property from one object to another object.
 *
 * If the source path does not exist (undefined)
 * the property on the other object will not be set.
 *
 * @param {String} source
 * @param {String} target
 * @param {Object} obj1
 * @param {Object} obj2
 * @param {Function|Array} mods
 * @param {Boolean} merge
 */
DotObject.prototype.copy = function (source, target, obj1, obj2, mods, merge) {
  if (typeof mods === 'function' || Array.isArray(mods)) {
    this.set(target,
      _process(
        // clone what is picked
        JSON.parse(
          JSON.stringify(
            this.pick(source, obj1, false)
          )
        ),
        mods
      ), obj2, merge)
  } else {
    merge = mods
    this.set(target, this.pick(source, obj1, false), obj2, merge)
  }

  return obj2
}

function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
 *
 * Set a property on an object using dot notation.
 *
 * @param {String} path
 * @param {Mixed} val
 * @param {Object} obj
 * @param {Boolean} merge
 */
DotObject.prototype.set = function (path, val, obj, merge) {
  var i
  var k
  var keys
  var key

  // Do not operate if the value is undefined.
  if (typeof val === 'undefined') {
    return obj
  }
  keys = parsePath(path, this.seperator)

  for (i = 0; i < keys.length; i++) {
    key = keys[i]
    if (i === (keys.length - 1)) {
      if (merge && isObject(val) && isObject(obj[key])) {
        for (k in val) {
          if (val.hasOwnProperty(k)) {
            obj[key][k] = val[k]
          }
        }
      } else if (merge && Array.isArray(obj[key]) && Array.isArray(val)) {
        for (var j = 0; j < val.length; j++) {
          obj[keys[i]].push(val[j])
        }
      } else {
        obj[key] = val
      }
    } else if (
      // force the value to be an object
      !obj.hasOwnProperty(key) ||
      (!isObject(obj[key]) && !Array.isArray(obj[key]))
    ) {
      // initialize as array if next key is numeric
      if (/^\d+$/.test(keys[i + 1])) {
        obj[key] = []
      } else {
        obj[key] = {}
      }
    }
    obj = obj[key]
  }
  return obj
}

/**
 *
 * Transform an object
 *
 * Usage:
 *
 *   var obj = {
 *     "id": 1,
  *    "some": {
  *      "thing": "else"
  *    }
 *   }
 *
 *   var transform = {
 *     "id": "nr",
  *    "some.thing": "name"
 *   }
 *
 *   var tgt = dot.transform(transform, obj)
 *
 * @param {Object} recipe Transform recipe
 * @param {Object} obj Object to be transformed
 * @param {Array} mods modifiers for the target
 */
DotObject.prototype.transform = function (recipe, obj, tgt) {
  obj = obj || {}
  tgt = tgt || {}
  Object.keys(recipe).forEach(function (key) {
    this.set(recipe[key], this.pick(key, obj), tgt)
  }.bind(this))
  return tgt
}

/**
 *
 * Convert object to dotted-key/value pair
 *
 * Usage:
 *
 *   var tgt = dot.dot(obj)
 *
 *   or
 *
 *   var tgt = {}
 *   dot.dot(obj, tgt)
 *
 * @param {Object} obj source object
 * @param {Object} tgt target object
 * @param {Array} path path array (internal)
 */
DotObject.prototype.dot = function (obj, tgt, path) {
  tgt = tgt || {}
  path = path || []
  Object.keys(obj).forEach(function (key) {
    if (Object(obj[key]) === obj[key]) {
      return this.dot(obj[key], tgt, path.concat(key))
    } else {
      tgt[path.concat(key).join(this.seperator)] = obj[key]
    }
  }.bind(this))
  return tgt
}

DotObject.pick = wrap('pick')
DotObject.move = wrap('move')
DotObject.transfer = wrap('transfer')
DotObject.transform = wrap('transform')
DotObject.copy = wrap('copy')
DotObject.object = wrap('object')
DotObject.str = wrap('str')
DotObject.set = wrap('set')
DotObject.del = DotObject.remove = wrap('remove')
DotObject.dot = wrap('dot')

;['override', 'overwrite'].forEach(function (prop) {
  Object.defineProperty(DotObject, prop, {
    get: function () {
      return dotDefault.override
    },
    set: function (val) {
      dotDefault.override = !!val
    }
  })
})

Object.defineProperty(DotObject, 'useArray', {
  get: function () {
    return dotDefault.useArray
  },
  set: function (val) {
    dotDefault.useArray = val
  }
})

DotObject._process = _process

module.exports = DotObject;
