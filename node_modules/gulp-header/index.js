/* jshint node: true */
'use strict';

/**
* Module dependencies.
*/

var Concat = require('concat-with-sourcemaps');
var extend = require('object-assign');
var through = require('through2');
var gutil = require('gulp-util');
var stream = require('stream');
var path = require('path');
var fs = require('fs');

/**
* gulp-header plugin
*/

module.exports = function (headerText, data) {
  headerText = headerText || '';

  function TransformStream(file, enc, cb) {
    var filename;
    var concat;

    if (typeof file === 'string') {
      filename = file;
    } else if (typeof file.path === 'string') {
      filename = path.basename(file.path);
    } else {
      filename = '';
    }

    var template = data === false ? headerText : gutil.template(headerText, extend({ file: file, filename: filename }, data));
    concat = new Concat(true, filename);

    if (fs.lstatSync(file.path).isDirectory()) {
      // make sure the file goes through the next gulp plugin
      this.push(file);

      // tell the stream engine that we are done with this file
      return cb();
    }


    if (file.isBuffer()) {
      concat.add(null, new Buffer(template));
    }

    if (file.isStream()) {
      var stream = through();
      stream.write(new Buffer(template));
      stream.on('error', this.emit.bind(this, 'error'));
      file.contents = file.contents.pipe(stream);
      this.push(file);
      return cb();
    }

    // add sourcemap
    concat.add(file.relative, file.contents, file.sourceMap);

    // make sure streaming content is preserved
    if (file.contents && !isStream(file.contents)) {
      file.contents = concat.content;
    }

    // apply source map
    if (concat.sourceMapping) {
      file.sourceMap = JSON.parse(concat.sourceMap);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);

    // tell the stream engine that we are done with this file
    cb();
  }

  return through.obj(TransformStream);
};

/**
* is stream?
*/

function isStream(obj) {
  return obj instanceof stream.Stream;
}
