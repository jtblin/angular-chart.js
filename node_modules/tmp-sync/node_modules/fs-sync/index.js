#!/usr/bin/env node

// External modules
var node_path = require('path');
var node_fs = require('fs');
var _ = require('lodash');
var iconv = require('iconv-lite');
var rimraf = require('rimraf');


var sync = module.exports = {};

// explode built-in fs methods to `fs-more`
// sync.__proto__ = node_fs;


// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
function processPatterns(patterns, fn) {

  // Filepaths to return.
  var result = [];
  // Iterate over flattened patterns array.
  _.flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) {
      pattern = pattern.slice(1);
    }
    // Find all matching files for this pattern.
    var matches = fn(pattern);

    if (exclusion) {
      // If an exclusion, remove matching files.
      result = _.difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = _.union(result, matches);
    }
  });

  return result;
};

// Are descendant path(s) contained within ancestor path? Note: does not test
// if paths actually exist.
sync.doesPathContain = function(ancestor) {
  ancestor = node_path.resolve(ancestor);

  var relative;
  var i = 1;

  for (; i < arguments.length; i++) {
    relative = node_path.relative(node_path.resolve(arguments[i]), ancestor);
    if (relative === '' || /\w+/.test(relative)) {
      return false;
    }
  }

  return true;
};

// @param {Object} options {
//        force: {boolean} force to overridding
// }
sync.copy = function(file, dest, options) {
  if (!options) {
    options = {};
  }

  // Just set encoding as `null` to force the file to R/W as a `Buffer`
  options.encoding = null;

  // 'abc/' -> '/xxxx/xxx/abc'
  // 'abc.js' -> '/xxx/xxx/abc.js'
  file = node_path.resolve(file);

  if (sync.isFile(file)) {
    var content = sync.read(file);

    if (options.force || !sync.exists(dest)) {
      return sync.write(dest, content, options);
    }

    return false;

  } else if (sync.isDir(file)) {

    var dir = file;
    dest = node_path.resolve(dest);

    sync.expand('**', {

      // to get relative paths to dir
      cwd: dir

    }).forEach(function(path) {
      var full_path = node_path.join(dir, path);

      if (sync.isFile(full_path)) {
        sync.copy(full_path, node_path.join(dest, path), options);
      }
    });
  }
};

var glob = require('glob');

// Return an array of all file paths that match the given wildcard patterns.
sync.expand = function(patterns, options) {

  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  patterns = Array.isArray(patterns) ? patterns : [patterns];

  return patterns.length === 0 ? [] :

    processPatterns(patterns, function(pattern) {

      // Find all matching files for this pattern.
      return glob.sync(pattern, options);
    });
};

var exists = node_fs.existsSync ?
  function(file) {
    return node_fs.existsSync(file);
  } :

  // if node -v <= 0.6, there's no fs.existsSync method.
  function(file) {
    try {
      node_fs.statSync(file);
      return true;
    } catch (e) {
      return false;
    }
  };


// @returns {boolean} true if the file path exists.
sync.exists = function() {
  var filepath = node_path.join.apply(node_path, arguments);
  return exists(filepath);
};


//@returns true if the file is a symbolic link.
sync.isLink = function() {
  var filepath = node_path.join.apply(node_path, arguments);
  return exists(filepath) && node_fs.lstatSync(filepath).isSymbolicLink();
};

// @returns {boolean} true if the path is a directory.
sync.isDir = function() {
  var filepath = node_path.join.apply(node_path, arguments);
  return exists(filepath) && node_fs.statSync(filepath).isDirectory();
};

// @returns {boolean} true if the path is a file.
sync.isFile = function() {
  var filepath = node_path.join.apply(node_path, arguments);
  return exists(filepath) && node_fs.statSync(filepath).isFile();
};

sync.isPathAbsolute = function() {
  var filepath = node_path.join.apply(node_path, arguments);
  return node_path.resolve(filepath) === filepath.replace(/[\/\\]+$/, '');
};

var mkdirp = require('mkdirp');

sync.mkdir = mkdirp.sync;

sync.defaultEncoding = 'utf-8';

sync.read = function(filepath, options) {
  if (!options) {
    options = {};
  }

  var contents;

  contents = node_fs.readFileSync(String(filepath));
  // If encoding is not explicitly null, convert from encoded buffer to a
  // string. If no encoding was specified, use the default.
  if (options.encoding !== null) {
    contents = iconv.decode(contents, options.encoding || sync.defaultEncoding);
    // Strip any BOM that might exist.
    if (contents.charCodeAt(0) === 0xFEFF) {
      contents = contents.substring(1);
    }
  }

  return contents;
};


sync.readJSON = function(filepath, options) {
  var src = sync.read(filepath, options);
  return JSON.parse(src);
};

// Delete folders and files recursively
sync.remove = function(filepath) {
  filepath = String(filepath);

  if (!sync.exists(filepath)) {
    return false;
  }

  rimraf.sync(filepath);

  return true;
};

// Write a file.
sync.write = function(filepath, contents, options) {
  if (!options) {
    options = {};
  }

  // Create path, if necessary.
  sync.mkdir(node_path.dirname(filepath));

  // If contents is already a Buffer, don't try to encode it. If no encoding
  // was specified, use the default.
  if (!Buffer.isBuffer(contents)) {
    contents = iconv.encode(contents, options.encoding || sync.defaultEncoding);
  }

  node_fs.writeFileSync(filepath, contents, options);

  return true;
};