/*jshint node:true*/
/*jshint mocha:true*/
/*global assert:true*/
describe('integration', function () {
  'use strict';

  var webshot = require('webshot'),
      gm = require('gm'),
      tmp = require('tmp-sync'),
      mkdirp = require('mkdirp').sync,
      cp = require('cp').sync,
      imgur = require('imgur-node-api'),
      server = require('testatic')(),
      WEBSHOT_OPTIONS = { renderDelay: process.env.DELAY || 2500, windowSize: { width: 1366, height: 768 }},
      WEBSHOT_FAILED_DIR = 'test/fixtures/shots/',
      dir;

  beforeEach(function () {
    dir = tmp.in() + '/';
  });

  afterEach(function () {
    tmp.clean();
  });

  after(function () {
    server.close();
  });

  mkdirp(WEBSHOT_FAILED_DIR);

  [
    '57-hex-colours',
    '54-not-enough-colours',
    '51-pie-update-colours',
    'configure-line-chart',
    'custom-directive',
    'charts'
  ].forEach(function (name) {
    it('compares screenshots for: ' + name, function (done) {
      var image = dir + name + '.png',
          url = 'http://localhost:8080/test/fixtures/' + name + '.html',
          expected = 'test/fixtures/' + name + '.png';

      webshot(url, image, WEBSHOT_OPTIONS, function (err) {
        if (err) return done(err);
        gm.compare(expected, image, process.env.TOLERANCE || 0.0001, function (err, isEqual) {
          if (err) return done(err);
          if (! isEqual) {
            var failed = WEBSHOT_FAILED_DIR + name + '-failed.png',
                msg = 'Expected screenshots to be similar. Screenshot saved to ' + failed;
            cp(image, failed);
            if (process.env.CI && process.env.IMGUR_ID) {
              imgur.setClientID(process.env.IMGUR_ID);
              imgur.upload(image, function (err, res) {
                if (err) return done(err);
                assert.fail(isEqual, true, msg + ', uploaded to ' + res.data.link);
              });
            } else {
              assert.fail(isEqual, true, msg);
            }
            return;
          }
          done();
        });
      });
    });
  });
});
