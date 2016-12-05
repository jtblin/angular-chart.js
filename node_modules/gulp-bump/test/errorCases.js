'use strict';

var File = require('vinyl');
var should = require('should');
var bump = require('..');

require('mocha');

describe('Test failure cases cases in gulp-bump', function() {

  var fakeFile = new File({
    path: 'some-dir/dummyfile.js',
    contents: new Buffer('{ "version": "0.A.0" }')
  });

  it('should fail with invalid semver version', function(done) {

    var bumpS = bump();

    bumpS.on('error', function(e) {
      should.exist(e);
      e.message.should.equal('Invalid semver: version key "version" is not found in file');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });
});
