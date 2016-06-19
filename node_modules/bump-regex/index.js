'use strict';

var semver = require('semver');
var clone = require('lodash.clone');

module.exports = function(options, cb) {
  var opts = clone(options);
  opts.key = opts.key || 'version';

  var regex = opts.regex || new RegExp(
    '([\'|\"]?' + opts.key + '[\'|\"]?[ ]*:[ ]*[\'|\"]?)(\\d+\\.\\d+\\.\\d+(-' +
    opts.preid +
    '\\.\\d+)?(-\\d+)?)[\\d||A-a|.|-]*([\'|\"]?)', 'i');

  if (opts.global) {
    regex = new RegExp(regex.source, 'gi');
  }

  var parsedOut;
  opts.str = opts.str.replace(regex, function(match, prefix, parsed, pre, nopre, suffix) {
    parsedOut = parsed;
    if (!semver.valid(parsed) && !opts.version) {
      return cb('Invalid semver ' + parsed);
    }
    opts.type = opts.type || 'patch';
    var version = opts.version || semver.inc(parsed, opts.type, opts.preid);
    opts.prev = parsed;
    opts.new = version;
    return prefix + version + (suffix || '');
  });

  if (!parsedOut) {
    return cb('Invalid semver');
  }

  return cb(null, opts);
};

