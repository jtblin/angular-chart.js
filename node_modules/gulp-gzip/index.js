/*jslint node: true */
'use strict';

var fs          = require('fs');
var path        = require('path');
var gutil       = require('gulp-util');
var through2    = require('through2');
var PluginError = gutil.PluginError;
var utils       = require('./lib/utils');
var compress    = require('./lib/compress.js');

var PLUGIN_NAME = 'gulp-gzip';

module.exports = function (options) {

  // Combine user defined options with default options
  var defaultConfig = {
    append: true,
    threshold: false,
    gzipOptions: {},
    skipGrowingFiles: false
  };
  var config = utils.merge(defaultConfig, options);

  // Create a through2 object stream. This is our plugin export
  var stream = through2.obj(gulpGzip);

  // Expose the config so we can test it
  stream.config = config;

  function gulpGzip(file, enc, done) {

    /*jshint validthis: true */
    var self = this;

    // Check for empty file
    if (file.isNull()) {
      // Pass along the empty file to the next plugin
      self.push(file);
      done();
      return;
    }

    // Call when finished with compression
    var finished = function(err, contents, wasCompressed) {
      if (err) {
        var error = new PluginError(PLUGIN_NAME, err, { showStack: true });
        self.emit('error', error);
        done();
        return;
      }

      var complete = function() {
        file.contents = contents;
        self.push(file);
        done();
      };

      var getFixedPath = function(filepath) {
        if (config.extension) {
          filepath += '.' + config.extension;
        } else if (config.preExtension) {
          filepath = filepath.replace(/(\.[^\.]+)$/, '.' + config.preExtension + '$1');
        } else if (config.append) {
          filepath += '.gz';
        }

        return filepath;
      };

      if (wasCompressed) {
        if (file.contentEncoding) {
          file.contentEncoding.push('gzip');
        } else {
          file.contentEncoding = [ 'gzip' ];
        }

        file.path = getFixedPath(file.path);
        complete();
      } else if (config.deleteMode) {
        var cwd = path.resolve(config.deleteModeCwd || process.cwd());
        var directory = typeof config.deleteMode === 'string' ? config.deleteMode : config.deleteMode(file);
        var filepath = path.resolve(cwd, directory, getFixedPath(file.relative));

        fs.exists(filepath, function(exists) {
          if(exists) {
            gutil.log(gutil.colors.green('Gzipped file ' + filepath + ' deleted'));
            fs.unlink(filepath, complete);
          } else {
            complete();
          }
        });
      } else {
        complete();
      }

      return;
    };

    compress(file.contents, config, finished);
  }

  return stream;
};
