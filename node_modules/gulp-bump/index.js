'use strict';

var path = require('path');
var pluginError = require('plugin-error');
var log = require('plugin-log');
var through = require('through2');
var semver = require('semver');
var Dot = require('dot-object');

module.exports = function(opts) {
  // set task options
  opts = setDefaultOptions(opts);

  return through.obj(function(file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }
    if (file.isStream()) {
      return cb(new pluginError('gulp-bump', 'Streaming not supported'));
    }

    var content = String(file.contents);
    var json;
    var ver;
    var dot;

    try {
      json = JSON.parse(content);
    } catch (e) {
      return cb(new pluginError('gulp-bump', 'Problem parsing JSON file', {
        fileName: file.path,
        showStack: true
      }));
    }

    // get the version and key
    if (opts.key.indexOf('.') > -1) {
      dot = new Dot();
      opts.value = dot.pick(opts.key, json);
      ver = bump(opts);
    }
    else {
      opts.value = json[opts.key];
      if (!semver.valid(opts.value) && !opts.version) {
        return cb(new pluginError('gulp-bump', 'Detected invalid semver ' + opts.key, {
          fileName: file.path,
          showStack: false
        }));
      }
      ver = bump(opts);
    }

    // set key
    if (!json[opts.key]) {
      // log to user that key didn't exist before
      log('Creating key', log.colors.red(opts.key), 'with version:', log.colors.cyan(ver));
    }

    if (dot) {
      dot.str(opts.key, ver, json);
    }

    else {
      json[opts.key] = ver;
    }

    file.contents = new Buffer(JSON.stringify(json, null, opts.indent || space(content)) + possibleNewline(content));

    log('Bumped \'' + log.colors.cyan(path.basename(file.path)) +
      '\' ' + log.colors.magenta(opts.key) +
      ' to: ' + log.colors.cyan(ver));

    cb(null, file);
  });
};

function bump(opts) {
  if (opts.version) {
    return opts.version;
  }

  return semver.inc(opts.value, opts.type, opts.preid);
}

function setDefaultOptions(opts) {
  opts = opts || {};
  opts.key = opts.key || 'version';
  opts.indent = opts.indent || void 0;
  // default type bump is patch
  if (!opts.type || !semver.inc('0.0.1', opts.type)) {
    opts.type = 'patch';
  }
  // if passed specific version - validate it
  if (opts.version && !semver.valid(opts.version, opts.type)) {
    log('invalid version used as option', log.colors.red(opts.version));
    opts.version = null;
  }
  return opts;
}

// Preserve new line at the end of a file
function possibleNewline(json) {
  var lastChar = (json.slice(-1) === '\n') ? '\n' : '';
  return lastChar;
}

// Figured out which "space" params to be used for JSON.stringfiy.
function space(json) {
  var match = json.match(/^(?:(\t+)|( +))"/m);
  return match ? (match[1] ? '\t' : match[2].length) : '';
}
