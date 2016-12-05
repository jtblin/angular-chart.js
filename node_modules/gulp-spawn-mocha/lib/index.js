// Module Requirements
var _ = require('lodash'),
    fs = require('fs'),
    through = require('through'),
    proc = require('child_process'),
    join = require('path').join,
    PluginError = require('gulp-util').PluginError;

/**
 * Returns a stream to use with Gulp which executes the passed files as Mocha
 * tests with given options. Child process inherits stdin and stdout.
 * @param  {Object} ops Options to pass to the mocha executable (see `mocha
 *     -h`). Also accepts additional `bin` property to specifiy custom mocha
 *     binary.
 * @return {Stream}     A readable and writable stream which excutes Mocha,
 *     piping stdout and stderr to the process stdout and stderr.
 */
module.exports = function (ops, coverage) {
  // Default ops
  ops = ops || {};
  // Setup
  var ist = ops.istanbul;
  var output = ops.output;
  // Using istanbul? Use _mocha, otherwise use mocha in order to support full node options (e.g., --debug-brk)
  var bin = ops.bin || join(require.resolve('mocha'), '..', 'bin', ist ? '_mocha' : 'mocha');
  var env = _.extend(_.clone(process.env), ops.env || {});
  var cwd = ops.cwd;
  ops = _.omit(ops, ['bin', 'env', 'istanbul', 'cwd']);

  // Create stream
  var stream = through(function (file) {
    this._files.push(file.path);
  }, function () {
    // Save refernce to this (bindless context cheat)
    var that = this;

    // Parse arguments
    var args = parseArgs(ops);
    // Using istanbul?
    if (ist) {
      args.unshift('--', bin);
      // The non-standard location of istanbul's bin makes me a wee bit nervous. Find it by inspecting package.json.
      bin = ist.bin || join(require.resolve('istanbul'), '..', require('istanbul/package.json').bin.istanbul);
      // If the value for istanbul is literally true, just keep the arguments array. Otherwise, parse istanbul options.
      args = ist === true ? args : parseArgs(_.omit(ist, ['bin'])).concat(args);
      args.unshift('cover');
    }
    // Execute Mocha, stdin and stdout are inherited
    this._child = proc.fork(bin, args.concat(this._files), {cwd: cwd, env: env, silent: !!output});
    // If there's an error running the process. See http://nodejs.org/api/child_process.html#child_process_event_error
    this._child.on('error', function (e) {
      that.emit('error', new PluginError('gulp-spawn-mocha', e));
    });
    // When done...
    this._child.on('close', function (code) {
      // If code is not zero (falsy)
      if (code) {
        that.emit('error', new PluginError('gulp-spawn-mocha', 'Mocha exited with code ' + code));
      }
      that.emit('end');
    });
    // Output to a file
    if (output) {
      var s = _.isString(output) ? fs.createWriteStream(output) : output;
      that._child.stdout.pipe(s);
      that._child.stderr.pipe(s);
    }
  });

  // Attach files array to stream
  stream._files = [];
  // Return stream
  return stream;
};

/**
 * Parses the arugments from a configuration object for passing to a mocha
 * executable.
 * @param  {Object} obj The object to parse from.
 * @return {Array}      An array of parsed arguments.
 */
function parseArgs(obj) {
  var args = [];
  _.each(obj, function (val, key) {
    if (_.isArray(val)) {
      _.each(val, function (val) {
        addArg(args, key, val);
      });
    } else {
      addArg(args, key, val);
    }
  });
  return args;
}

/**
 * Adds a given argument with name and value to arugment array.
 * @param {Array}  args String array of arguments.
 * @param {String} name Name of the argument.
 * @param {String} val  Value of the argument. Returns without doing anything
 *     if falsy and not zero.
 */
function addArg(args, name, val) {
  if (!val && val !== 0) {
    return;
  }
  args.push(name.length > 1 ? '--' + _.kebabCase(name) : '-' + name);
  if (_.isString(val) || _.isNumber(val)) {
    args.push(val);
  }
}
