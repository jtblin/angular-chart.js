/*jshint mocha:true*/
/*global assert:true*/
describe('integration', function () {
  'use strict';

  var expected = 'test/fixtures/charts.png',
      webshot = require('webshot'),
      gm = require('gm'),
      tmp = require('tmp-sync'),
      mkdirp = require('mkdirp').sync,
      cp = require('cp').sync,
      server = require('testatic')(),
      WEBSHOT_OPTIONS = { renderDelay: 3000, windowSize: { width: 1366, height: 768 }},
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

  ['charts'].forEach(function (name) {
    it('compares screenshots for: ' + name, function (done) {
      var image = dir + name + '.png',
          url = 'http://localhost:8080/test/fixtures/' + name + '.html';

      webshot(url, image, WEBSHOT_OPTIONS, function (err) {
        if (err) return done(err); // TODO: copy screenshot for manual comparison
        gm.compare(expected, image, 0.001, function (err, isEqual) {
          if (err) return done(err);
          if (! isEqual) {
            var failed = WEBSHOT_FAILED_DIR + name + '-failed.png';
            cp(image, failed);
            assert.fail(isEqual, true, 'Expected screenshots to be similar. Screenshot saved to ' + failed);
            return;
          }
          done();
        });
      });
    });
  });
});
