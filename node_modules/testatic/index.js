(function () {
  'use strict';

  var Static = require('node-static');

  module.exports = function (dir, port) {
    var fileServer = new Static.Server(dir || './');

    return require('http').createServer(function (req, res) {
      req.addListener('end', function () {
        fileServer.serve(req, res);
      }).resume();
    }).listen(port || 8080);

  };

})();
