(function (plugin) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // NodeJS
    module.exports = plugin;
  }
  else {
    if (typeof define === "function" && define.amd) {
      // AMD
      define(function () {
        return plugin;
      });
    }
    else {
      // Other environment (usually <script> tag): plug in to global chai instance directly.
      chai.use(plugin);
    }
  }
}(function (chai, utils) {
  chai.string = chai.string || {};

  function isString(value) {
    return typeof value === 'string';
  }

  chai.string.startsWith = function (str, prefix) {
    if (!isString(str) || !isString(prefix)) {
      return false;
    }
    return str.indexOf(prefix) === 0;
  };

  chai.string.endsWith = function (str, suffix) {
    if (!isString(str) || !isString(suffix)) {
      return false;
    }
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  chai.string.equalIgnoreCase = function (str1, str2) {
    if (!isString(str1) || !isString(str2)) {
      return false;
    }
    return str1.toLowerCase() === str2.toLowerCase();
  };

  chai.string.equalIgnoreSpaces = function (str1, str2) {
    if (!isString(str1) || !isString(str2)) {
      return false;
    }
    return str1.replace(/\s/g, '') === str2.replace(/\s/g, '');
  };

  chai.string.containIgnoreSpaces = function (str1, str2) {
    if (!isString(str1) || !isString(str2)) {
      return false;
    }
    return str1.replace(/\s/g, '').indexOf(str2.replace(/\s/g, '')) > -1;
  };

  chai.string.singleLine = function(str) {
    if (!isString(str)) {
      return false;
    }
    return str.trim().indexOf("\n") === -1;
  };

  chai.string.reverseOf = function(str, reversed) {
    if (!isString(str) || !isString(reversed)) {
      return false;
    }
    return str.split('').reverse().join('') === reversed;
  };

  chai.string.palindrome = function(str) {
    if (!isString(str)) {
      return false;
    }
    var len = str.length;
    for ( var i = 0; i < Math.floor(len/2); i++ ) {
      if (str[i] !== str[len - 1 - i]) {
        return false;
      }
    }
    return true;
  };

  chai.string.entriesCount = function(str, substr, count) {
    var matches = 0;
    if (isString(str) && isString(substr)) {
      var i = 0;
      var len = str.length;
      while (i < len) {
        var indx = str.indexOf(substr, i);
        if (indx === -1) {
          break;
        }
        else {
          matches++;
          i = indx + 1;
        }
      }
    }
    return matches === count;
  };

  chai.string.indexOf = function(str, substr, index) {
    var indx = !isString(str) || !isString(substr) ? -1 : str.indexOf(substr);
    return indx === index;
  };

  var startsWithMethodWrapper = function (expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.startsWith(actual, expected),
      'expected ' + this._obj + ' to start with ' + expected,
      'expected ' + this._obj + ' not to start with ' + expected
    );
  };

  chai.Assertion.addChainableMethod('startsWith', startsWithMethodWrapper);
  chai.Assertion.addChainableMethod('startWith', startsWithMethodWrapper);

  var endsWithMethodWrapper = function (expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.endsWith(actual, expected),
      'expected ' + this._obj + ' to end with ' + expected,
      'expected ' + this._obj + ' not to end with ' + expected
    );
  };

  chai.Assertion.addChainableMethod('endsWith', endsWithMethodWrapper);
  chai.Assertion.addChainableMethod('endWith', endsWithMethodWrapper);

  chai.Assertion.addChainableMethod('equalIgnoreCase', function (expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.equalIgnoreCase(actual, expected),
      'expected ' + this._obj + ' to equal ' + expected + ' ignoring case',
      'expected ' + this._obj + ' not to equal ' + expected + ' ignoring case'
    );
  });

  chai.Assertion.addChainableMethod('equalIgnoreSpaces', function (expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.equalIgnoreSpaces(actual, expected),
      'expected ' + this._obj + ' to equal ' + expected + ' ignoring spaces',
      'expected ' + this._obj + ' not to equal ' + expected + ' ignoring spaces'
    );
  });

  chai.Assertion.addChainableMethod('containIgnoreSpaces', function (expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.containIgnoreSpaces(actual, expected),
      'expected ' + this._obj + ' to contain ' + expected + ' ignoring spaces',
      'expected ' + this._obj + ' not to contain ' + expected + ' ignoring spaces'
    );
  });

  chai.Assertion.addChainableMethod('singleLine', function () {
    var actual = this._obj;

    return this.assert(
      chai.string.singleLine(actual),
      'expected ' + this._obj + ' to be a single line',
      'expected ' + this._obj + ' not to be a single line'
    );
  });

  chai.Assertion.addChainableMethod('reverseOf', function(expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.reverseOf(actual, expected),
      'expected ' + this._obj + ' to be the reverse of ' + expected,
      'expected ' + this._obj + ' not to be the reverse of ' + expected
    );
  });

  chai.Assertion.addChainableMethod('palindrome', function () {
    var actual = this._obj;

    return this.assert(
      chai.string.palindrome(actual),
      'expected ' + this._obj + ' to be a palindrome',
      'expected ' + this._obj + ' not to be a palindrome'
    );
  });

  chai.Assertion.addChainableMethod('entriesCount', function(substr, expected) {
    var actual = this._obj;

    return this.assert(
      chai.string.entriesCount(actual, substr, expected),
      'expected ' + this._obj + ' to have ' + substr + ' ' + expected + ' time(s)',
      'expected ' + this._obj + ' to not have ' + substr + ' ' + expected + ' time(s)'
    );
  });

  chai.Assertion.addChainableMethod('indexOf', function(substr, index) {
    var actual = this._obj;

    return this.assert(
        chai.string.indexOf(actual, substr, index),
        'expected ' + this._obj + ' to have ' + substr + ' on index ' + index,
        'expected ' + this._obj + ' to not have ' + substr + ' on index ' + index
    );
  });

  // Asserts
  var assert = chai.assert;

  assert.startsWith = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.startsWith(exp);
  };

  assert.notStartsWith = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.not.startsWith(exp);
  };

  assert.endsWith = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.endsWith(exp);
  };

  assert.notEndsWith = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.not.endsWith(exp);
  };

  assert.equalIgnoreCase = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.be.equalIgnoreCase(exp);
  };

  assert.notEqualIgnoreCase = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.equalIgnoreCase(exp);
  };

  assert.equalIgnoreSpaces = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.be.equalIgnoreSpaces(exp);
  };

  assert.notEqualIgnoreSpaces = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.equalIgnoreSpaces(exp);
  };

  assert.containIgnoreSpaces = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.be.containIgnoreSpaces(exp);
  };

  assert.notContainIgnoreSpaces = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.containIgnoreSpaces(exp);
  };

  assert.singleLine = function(val, exp, msg) {
    new chai.Assertion(val, msg).to.be.singleLine();
  };

  assert.notSingleLine = function(val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.singleLine();
  };

  assert.reverseOf = function(val, exp, msg) {
    new chai.Assertion(val, msg).to.be.reverseOf(exp);
  };

  assert.notReverseOf = function(val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.reverseOf(exp);
  };

  assert.palindrome = function(val, exp, msg) {
    new chai.Assertion(val, msg).to.be.palindrome();
  };

  assert.notPalindrome = function(val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.palindrome();
  };

  assert.entriesCount = function(str, substr, count, msg) {
    new chai.Assertion(str, msg).to.have.entriesCount(substr, count);
  };

  assert.indexOf = function(str, substr, index, msg) {
    new chai.Assertion(str, msg).to.have.indexOf(substr, index);
  };

}));
