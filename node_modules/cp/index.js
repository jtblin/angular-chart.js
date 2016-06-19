
/**
 * Module dependencies.
 */

var fs = require('fs');
try { fs = require('graceful-fs'); } catch (e) {}

/**
 * Magic number.
 */

var MAX_BUFFER = 1024;

/**
 * Export `cp`.
 */

exports = module.exports = cp;

/**
 * Export `sync`.
 */

exports.sync = sync;

/**
 * Copy `src` to `dest`, invoking `cb(err)` when done.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} [cb]
 * @api public
 */

function cp(src, dest, cb) {
  // yield support
  if ('function' != typeof cb) return thunk;

  var complete = false;
  var read = fs.createReadStream(src);
  var write = fs.createWriteStream(dest);

  write.on('error', done);
  write.on('close', done);
  read.on('error', done);
  read.pipe(write);

  // done callback
  function done(err) {
    if (!complete) {
      complete = true;
      read.destroy();
      write.destroy();
      cb(err);
    }
  }

  // thunk-ified
  function thunk(done) {
    cp(src, dest, done);
  }
}

/**
 * Synchronously copy file `src` to `dest`
 *
 * @param {String} src
 * @param {String} dest
 * @api public
 */

function sync(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error('no such file or directory: ' + src);
  }

  var buffer = new Buffer(MAX_BUFFER);
  var bytesRead = MAX_BUFFER;
  var pos = 0;
  var read = fs.openSync(src, 'r');
  var write = fs.openSync(dest, 'w');

  while (MAX_BUFFER == bytesRead) {
    bytesRead = fs.readSync(read, buffer, 0, MAX_BUFFER, pos);
    fs.writeSync(write, buffer, 0, bytesRead);
    pos += bytesRead;
  }

  fs.closeSync(read);
  fs.closeSync(write);
}
