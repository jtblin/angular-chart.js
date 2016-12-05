'use strict';
var utils = require('./utils'),
  unixStylePath = utils.unixStylePath,
  PLUGIN_NAME = utils.PLUGIN_NAME,
  through = require('through2'),
  fs = require('graceful-fs'),
  path = require('path'),
  File = require('vinyl'),
  stripBom = require('strip-bom');

/**
 * Write the source map
 *
 * @param options options to change the way the source map is written
 *
 */
function write(destPath, options) {
  var debug = require('debug-fabulous')()(PLUGIN_NAME + ':write');

  if (options === undefined && typeof destPath !== 'string') {
    options = destPath;
    destPath = undefined;
  }
  options = options || {};

  // set defaults for options if unset
  if (options.includeContent === undefined)
    options.includeContent = true;
  if (options.addComment === undefined)
    options.addComment = true;
  if (options.charset === undefined)
    options.charset = "utf8";

  debug(function() {
    return options;
  });

  function sourceMapWrite(file, encoding, callback) {
    /*jshint validthis:true */

    if (file.isNull() || !file.sourceMap) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      return callback(new Error(PLUGIN_NAME + '-write: Streaming not supported'));
    }

    var sourceMap = file.sourceMap;
    // fix paths if Windows style paths
    sourceMap.file = unixStylePath(file.relative);

    if (options.mapSources && typeof options.mapSources === 'function') {
      sourceMap.sources = sourceMap.sources.map(function(filePath) {
        return options.mapSources(filePath);
      });
    }

    sourceMap.sources = sourceMap.sources.map(function(filePath) {
      return unixStylePath(filePath);
    });

    if (typeof options.sourceRoot === 'function') {
      sourceMap.sourceRoot = options.sourceRoot(file);
    } else {
      sourceMap.sourceRoot = options.sourceRoot;
    }
    if (sourceMap.sourceRoot === null) {
      sourceMap.sourceRoot = undefined;
    }

    if (options.includeContent) {
      sourceMap.sourcesContent = sourceMap.sourcesContent || [];

      // load missing source content
      for (var i = 0; i < file.sourceMap.sources.length; i++) {
        if (!sourceMap.sourcesContent[i]) {
          var sourcePath = path.resolve(sourceMap.sourceRoot || file.base, sourceMap.sources[i]);
          try {
            if (options.debug)
              debug('No source content for "' + sourceMap.sources[i] + '". Loading from file.');
            sourceMap.sourcesContent[i] = stripBom(fs.readFileSync(sourcePath, 'utf8'));
          } catch (e) {
            if (options.debug)
              debug('source file not found: ' + sourcePath);
            }
          }
      }
    } else {
      delete sourceMap.sourcesContent;
    }

    var comment,
      commentFormatter = utils.getCommentFormatter(file);

    if (destPath === undefined || destPath === null) {
      // encode source map into comment
      var base64Map = new Buffer(JSON.stringify(sourceMap)).toString('base64');
      debug("basic comment")
      comment = commentFormatter('data:application/json;charset=' + options.charset + ';base64,' + base64Map);
    } else {
      var mapFile = path.join(destPath, file.relative) + '.map';
      // custom map file name
      if (options.mapFile && typeof options.mapFile === 'function') {
        mapFile = options.mapFile(mapFile);
      }

      var sourceMapPath = path.join(file.base, mapFile);

      // if explicit destination path is set
      if (options.destPath) {
        var destSourceMapPath = path.join(file.cwd, options.destPath, mapFile);
        var destFilePath = path.join(file.cwd, options.destPath, file.relative);
        sourceMap.file = unixStylePath(path.relative(path.dirname(destSourceMapPath), destFilePath));
        if (sourceMap.sourceRoot === undefined) {
          sourceMap.sourceRoot = unixStylePath(path.relative(path.dirname(destSourceMapPath), file.base));
        } else if (sourceMap.sourceRoot === '' || (sourceMap.sourceRoot && sourceMap.sourceRoot[0] === '.')) {
          sourceMap.sourceRoot = unixStylePath(path.join(path.relative(path.dirname(destSourceMapPath), file.base), sourceMap.sourceRoot));
        }
      } else {
        // best effort, can be incorrect if options.destPath not set
        sourceMap.file = unixStylePath(path.relative(path.dirname(sourceMapPath), file.path));
        if (sourceMap.sourceRoot === '' || (sourceMap.sourceRoot && sourceMap.sourceRoot[0] === '.')) {
          sourceMap.sourceRoot = unixStylePath(path.join(path.relative(path.dirname(sourceMapPath), file.base), sourceMap.sourceRoot));
        }
      }

      var sourceMapFile;
      sourceMapFile = file.clone(options.clone || {deep:false, contents:false});
      sourceMapFile.path = sourceMapPath;
      sourceMapFile.contents = new Buffer(JSON.stringify(sourceMap));
      sourceMapFile.stat = {
        isFile: function () { return true; },
        isDirectory: function () { return false; },
        isBlockDevice: function () { return false; },
        isCharacterDevice: function () { return false; },
        isSymbolicLink: function () { return false; },
        isFIFO: function () { return false; },
        isSocket: function () { return false; }
      };
      this.push(sourceMapFile);

      var sourceMapPathRelative = path.relative(path.dirname(file.path), sourceMapPath);

      if (options.sourceMappingURLPrefix) {
        var prefix = '';
        if (typeof options.sourceMappingURLPrefix === 'function') {
          prefix = options.sourceMappingURLPrefix(file);
        } else {
          prefix = options.sourceMappingURLPrefix;
        }
        sourceMapPathRelative = prefix + path.join('/', sourceMapPathRelative);
      }
      debug("destPath comment")
      comment = commentFormatter(unixStylePath(sourceMapPathRelative));

      if (options.sourceMappingURL && typeof options.sourceMappingURL === 'function') {
        debug("options.sourceMappingURL comment")
        comment = commentFormatter(options.sourceMappingURL(file));
      }
    }

    var preExisting = options.preExisting && utils.getPreExisting(String(file.contents));
    // append source map comment
    if (options.addComment && !preExisting){
      file.contents = Buffer.concat([file.contents, new Buffer(comment)]);
    }

    this.push(file);
    callback();
  }

  return through.obj(sourceMapWrite);
}

module.exports = write;
