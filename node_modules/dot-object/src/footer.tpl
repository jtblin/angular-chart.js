

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return DotObject;
    });
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = DotObject;
  } else {
    global[exportName] = DotObject;
  }

})(this, 'DotObject');