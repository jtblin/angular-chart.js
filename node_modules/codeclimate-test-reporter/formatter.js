var lcovParse = require('lcov-parse');
var path = require('path');
var fs = require('fs');
var pjson = require('./package.json');
var git  = require("./git_info");
var ci  = require("./ci_info");
var async = require("async");
var gocoverParse = require('./gocover_parse');

function Formatter(options) {
  this.options = options || {};
}

Formatter.prototype.rootDirectory = function() {
  return this.options.rootDirectory || process.cwd();
};

Formatter.prototype.parse = function(data, callback) {
    if (/^SF:/m.test(data)) {
        lcovParse(data, callback);
    } else if (/^mode:/.test(data)) {
        gocoverParse(data, callback);
    } else {
        callback("Unknown input coverage format", null);
    }
}

Formatter.prototype.format = function(coverageData, callback) {
  var self = this;

  self.parse(coverageData, function(parseError, data) {
    if (parseError) {
      throw parseError;
    }

    var result = {
      source_files: self.sourceFiles(data),
      run_at: Date.now(),
      partial: false,
      environment: {
        pwd: process.cwd().split(path.sep).join('/'),
        package_version: pjson.version
      },
      ci_service: ci.getInfo()
    };
    async.parallel({
      head: git.head,
      branch: git.branch,
      committed_at: git.committedAt
    },
    function(err, results) {
      if (err) {
        console.error(err.message);
      }
      result.git = {
        head: results.head,
        branch: results.branch,
        committed_at: results.committed_at
      };
      return callback(parseError, result);
    });
  });
};

Formatter.prototype.sourceFiles = function(data) {
  var source_files = [];
  var self = this;
  data.forEach(function(elem, index) {
    var content;
    try {
      content = fs.readFileSync(elem.file).toString();
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('The file ' + elem.file + ' does not exist and will be skipped.');
        content = '';
      } else {
        throw e;
      }
    }
    var numLines = content.split("\n").size;

    var coverage = new Array(numLines);
    coverage.forEach(function(elem, index, arr) {
      arr[index] = null;
    });
    elem.lines.details.forEach(function(lineDetail) {
      coverage[lineDetail.line - 1] = lineDetail.hit;
    });

    var fileName = path.relative(self.rootDirectory(), elem.file);
    if (path.sep !== '/') {
      fileName = fileName.split(path.sep).join('/');
    }

    source_files.push({
      name: fileName,
      blob_id: git.blobId(elem.file, content),
      coverage: JSON.stringify(coverage)
    });
  });
  return source_files;
};

module.exports = Formatter;
