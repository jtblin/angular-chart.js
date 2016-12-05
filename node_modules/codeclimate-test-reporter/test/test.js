var assert = require("assert");
var fs = require('fs')
var Formatter = require('../formatter.js');
var CiInfo = require('../ci_info');

describe('JSON', function(){

  var rootDirectory = "/Users/noah/p/request";
  var lcovFixture = fs.readFileSync('test/fixtures/lcov.info').toString();
  var gocoverFixture = fs.readFileSync('test/fixtures/cover.out').toString();
  var formatter = new Formatter({rootDirectory: rootDirectory});

  describe('parse', function() {
    it("should return the correct filenames", function(done) {
      formatter.format(lcovFixture, function(err, data) {
        var names = data.source_files.map(function(elem) {
          return elem.name;
        });
        expected = ["lib/cookies.js", "lib/copy.js"]
        assert.deepEqual(expected, names);
        done();
      });
    });
  });

  describe('gocover', function() {
    it('should return the correct filenames', function(done) {
      process.env.GOPATH = rootDirectory; // files will be at $GOPATH/src
      formatter.format(gocoverFixture, function(err, data) {
        var names = data.source_files.map(function(elem) {
          return elem.name;
        });
        var expected = [
          'src/golang.org/x/tools/cmd/cover/cover.go',
          'src/golang.org/x/tools/cmd/cover/func.go',
          'src/golang.org/x/tools/cmd/cover/html.go'
        ];
        assert.deepEqual(expected, names);
        done();
      });
    });
  });
});

describe('ci_info', function() {
  describe('#getInfo', function() {
    var bupenv = Object.keys(process.env);

    beforeEach(function(){
      delete process.env['TRAVIS'];
    });

    afterEach(function(){
      for(var pk in process.env) {
        if (bupenv.indexOf(pk) < 0) {
          delete process.env[pk];
        }
      }
    });

    it('should return travis-ci as name if process.env.TRAVIS is set', function() {
      process.env.TRAVIS = 'true';

      var ci = CiInfo.getInfo();
      assert.equal(ci.name, 'travis-ci');
    });

    it('should return appveyor as name if process.env.APPVEYOR is set', function() {
      process.env.APPVEYOR = 'true';

      var ci = CiInfo.getInfo();
      assert.equal(ci.name, 'appveyor');
    });

    it('should return buildkite as name if process.env.BUILDKITE is set', function() {
      process.env.BUILDKITE = 'true';

      var ci = CiInfo.getInfo();
      assert.equal(ci.name, 'buildkite');
    });

  });
});