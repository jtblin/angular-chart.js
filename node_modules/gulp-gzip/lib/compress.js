var zlib     = require('zlib');
var Readable = require('stream').Readable;
var toArray  = require('stream-to-array');

function convertContentsToBuffer(contents, callback) {
  if (contents instanceof Buffer) {
    callback(null, contents);
  } else {
    toArray(contents, function (err, chunks) {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, Buffer.concat(chunks));
    });
  }
}

function convertContentsToStream(contents, callback) {
  if (contents instanceof Readable) {
    callback(null, contents);
  } else {
  var rs = new Readable({ objectMode: true });
    rs._read = function() {
      rs.push(contents);
      rs.push(null);
    };
    callback(null, rs);
  }
}

module.exports = function(originalContents, options, callback) {

  convertContentsToBuffer(originalContents, function(err, contentsAsBuffer) {
    if (err) {
      callback(err, null, false);
      return;
    }

    var originalContentLength = contentsAsBuffer.length;

    // Check if the threshold option is set
    // If true, check if the buffer length is greater than the threshold
    if (options.threshold && originalContentLength < options.threshold) {
      // File size is smaller than the threshold
      // Pass it along to the next plugin without compressing
        if (originalContents instanceof Buffer) {
          callback(null, contentsAsBuffer, false);
        } else {
          convertContentsToStream(contentsAsBuffer, function(err, contentsAsStream) {
            callback(null, contentsAsStream, false);
          });
        }
      return;
    }

    convertContentsToStream(contentsAsBuffer, function(err, contentsAsStream) {
      if (err) {
        callback(err, null, false);
        return;
      }

      // Compress the contents
      var gzipStream = zlib.createGzip(options.gzipOptions);
      contentsAsStream.pipe(gzipStream);

      convertContentsToBuffer(gzipStream, function(err, compressedContentsAsBuffer) {
        if (err) {
          callback(err, null, false);
          return;
        }

        if (options.skipGrowingFiles && compressedContentsAsBuffer.length >= originalContentLength) {
          callback(null, originalContents, false);
        } else {
          if (originalContents instanceof Buffer) {
            callback(null, compressedContentsAsBuffer, true);
          } else {
            convertContentsToStream(compressedContentsAsBuffer, function(err, compressedContentsStream) {
              callback(null, compressedContentsStream, true);
            });
          }
        }
      });
    });
  });
};
