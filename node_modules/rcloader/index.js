module.exports = RcLoader;

var path = require('path');
var assign = require('lodash.assign');
var isObject = require('lodash.isobject');
var merge = require('lodash.merge');
var RcFinder = require('rcfinder');

function RcLoader(name, userConfig, finderConfig) {
  if (!(this instanceof RcLoader))
    return new RcLoader(name, userConfig, finderConfig);

  if (!name)
    throw new TypeError('Specify a name for your config files');

  finderConfig = isObject(finderConfig) ? finderConfig : {};

  var config = {};
  var configPending = false;
  var lookup = userConfig && userConfig.lookup !== void 0 ? !!userConfig.lookup : true;
  var finder = new RcFinder(name, finderConfig);

  if (typeof userConfig === 'string') {
    lookup = false;
    config.defaultFile = userConfig;
  } else {
    assign(config, userConfig || {});
  }

  var defaultFileGiven = (config.defaultFile !== undefined);
  if (defaultFileGiven) {
    if (finder.canLoadSync) {
      assign(config, finder.get(config.defaultFile));
    } else {
      // push callbacks here that need to wait for config to load
      configPending = [];
      // force the async loader
      finder.get(config.defaultFile, function (err, defaults) {
        if (err) throw err;
        assign(config, defaults);

        // clear the configPending queue
        var cbs = configPending;
        configPending = null;
        cbs.forEach(function (cb) { cb(); });
      });
    }
  }

  // these shouldn't be a part of the final config
  delete config.defaultFile;
  delete config.lookup;

  // get the config for a file
  this.for = function (filename, cb) {
    var sync = typeof cb !== 'function';

    function respond(err, configFile) {
      if (err && !sync) return cb(err);

      // the config has not loaded yet, delay our response
      // until it is
      if (!sync && configPending) {
        return configPending.push(function () {
          respond(err, configFile);
        });
      }

      // merge these into a fresh object to ensure that configFile
      // is never the same object.
      if (defaultFileGiven) {
        configFile = merge({}, config, configFile || {});
      } else {
        configFile = merge({}, configFile || {}, config);
      }

      if (sync) return configFile;
      cb(void 0, configFile);
    }

    if (!lookup) {
      if (sync) return respond();
      return process.nextTick(respond);
    }

    if (sync) return respond(null, finder.find(path.dirname(filename)));
    finder.find(path.dirname(filename), respond);
  };

}
