'use strict'

module.exports = function(data, cb) {
  var memo = {};
  var parsedData = [];

  var lines = data.split('\n');

  // Skip mode line
  lines.shift();

  lines.forEach(function(line) {
    // coverage line syntax:
    // Filename:<start line>.<start column>,<end line>.<end column>.<# of statements>.<hit count>
    var data = line.match(/(.*?):(\d+).\d+,(\d+).\d+ \d+ (\d+)/);
    if (!data) {
      return;
    }

    // filename is given relative to $GOPATH/src, so tack $GOPATH/src on the
    // front. Converting it to a relative filenae is handled by the formatter.
    var filename = process.env.GOPATH + '/src/' + data[1];
    var startLine = data[2];
    var endLine = data[3];
    var hitCount = data[4];

    if (!memo[filename]) {
      memo[filename] = {
        file: filename,
        lines: {
          details: []
        }
      }
      parsedData.push(memo[filename])
    }

    var lineData = memo[filename].lines;

    var i = startLine;
    for(var i = startLine; i <= endLine; i++) {
      lineData.details.push({
        line: i*1,
        hit: hitCount*1
      })
    }
  });

  cb(null, parsedData);
}

