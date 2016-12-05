'use strict';

var File = require('vinyl');
var should = require('should');
var bump = require('..');

require('mocha');

describe('gulp-bump: JSON comparison fixtures', function() {

  it('should bump patch version by default', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.0.9" }'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump();

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.0.10');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should bump patch version as default and a key=appversion', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "appversion": "0.0.1" }'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({key: 'appversion'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).appversion.should.equal('0.0.2');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should ignore invalid type and use type=patch', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.0.1" }'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({type: 'invalidType'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.0.2');
      return done();
    });

    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should set the correct version when supplied', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.0.1" }'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({version: '0.0.2'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.0.2');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should bump prerelease version', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.0.1-0"}'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({type: 'prerelease'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.0.1-1');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

   it('should bump to a prerelease version with a preid', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.0.1"}'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({type: 'prerelease', preid : 'alphaWhateverTheYWant'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.0.2-alphaWhateverTheYWant.0');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should bump preid version', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.1.0-zeta.1"}'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({type: 'prerelease', preid: 'zeta'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.1.0-zeta.2');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should update prerelease tags without a version', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.1.0-zeta"}'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({type: 'patch'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      JSON.parse(newFile.contents.toString()).version.should.equal('0.1.0');
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });

  it('should return bumpData', function(done) {
    var fakeFile = new File({
      contents: new Buffer('{ "version": "0.1.0-zeta.1"}'),
      path: 'test/fixtures/test.json'
    });

    var bumpS = bump({type: 'minor'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);
      should.exist(newFile.bumpData);
      should.exist(newFile.bumpData.new);
      should.exist(newFile.bumpData.prev);
      should.exist(newFile.bumpData.type);
      return done();
    });
    bumpS.write(fakeFile);
    bumpS.end();
  });
});
