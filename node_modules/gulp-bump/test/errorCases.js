'use strict';

var File = require('vinyl');
var should = require('should');
var bump = require('..');

require('mocha');

describe('Test failure cases cases in gulp-bump', function() {

  var fakeFile = new File({
    path: 'some-dir/dummyfile.js',
    contents: new Buffer('{ "version": "0.0.0" }')
  });

  it('should fail when not detect a valid semver version', function(done) {

    fakeFile.contents = new Buffer('{ "version": "0.A.1" }');

    var bumpS = bump();

    bumpS.on('error', function(e) {
      should.exist(e);
      e.message.should.equal('Detected invalid semver version');
      e.fileName.should.containEql(fakeFile.path);
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should fail with an invalid semver version', function(done) {
    fakeFile.contents = new Buffer('{ "version": "0.0.1" }');

    var bumpS = bump({key: 'appversion'});

    bumpS.on('error', function(e) {
      should.exist(e);
      e.message.should.containEql('Detected invalid semver appversion');
      e.fileName.should.containEql(fakeFile.path);
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should fail when supplied with an invalid JSON', function(done) {
    fakeFile.contents = new Buffer('{ invalid json oh no!!!}');

    var bumpS = bump();

    bumpS.on('error', function(e) {
      should.exist(e);
      e.name.should.equal('Error');
      e.message.should.containEql('Problem parsing JSON file');
      e.fileName.should.containEql(fakeFile.path);
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should fallback to defaults when supplied with invalid semver version', function(done) {
    fakeFile.contents = new Buffer('{ "version": "0.0.1" }');

    var bumpS = bump({version: '0.A.2'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.0.2');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });
});
