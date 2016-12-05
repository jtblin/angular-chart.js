'use strict';

var semver = require('semver');
var extend = require('xtend')

module.exports = function(options, cb) {
  if (typeof options === 'string') {
    options = {
      str: options
    }
  }

  var defaultOpts = {
    key: 'version',
    type: 'patch'
  }

  var opts = extend(defaultOpts, options);

  var regex = opts.regex || new RegExp(
    '([\'|\"]?' + opts.key + '[\'|\"]?[ ]*[:=][ ]*[\'|\"]?[a-z]?)(\\d+\\.\\d+\\.\\d+)' +
    '(-[0-9A-Za-z\.-]+)?([\'|\"]?)', 'i');

  if (opts.global) {
    regex = new RegExp(regex.source, 'gi');
  }

  var parsedOut;
  opts.str = opts.str.replace(regex, function(match, prefix, parsed, prerelease, suffix) {
    parsed = parsed + (prerelease || '')
    parsedOut = parsed;
    if (!semver.valid(parsed) && !opts.version) {
      return cb('Invalid semver ' + parsed);
    }
    var version = opts.version || semver.inc(parsed, opts.type, opts.preid);
    opts.prev = parsed;
    opts.new = version;
    return prefix + version + (suffix || '');
  });

  if (!parsedOut) {
    return cb('Invalid semver: version key "' + opts.key + '" is not found in file');
  }

  return cb(null, opts);
};
