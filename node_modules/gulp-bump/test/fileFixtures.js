'use strict';

var fs = require('fs');
var File = require('vinyl');
var should = require('should');
var bump = require('..');

require('mocha');

var fixtureFile = fs.readFileSync('test/fixtures/package.json');

describe('gulp-bump: JSON File fixtures', function() {

  it('should bump minor by default', function(done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/package.json',
      contents: fixtureFile
    });

    var bumpS = bump();

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.path);
      should.exist(newFile.contents);
      String(newFile.contents).should.equal(fs.readFileSync('test/expected/default.json', 'utf8'));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should bump major if options.bump = major', function(done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/package.json',
      contents: fixtureFile
    });

    var bumpS = bump({type: 'major'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.path);
      should.exist(newFile.contents);
      String(newFile.contents).should.equal(fs.readFileSync('test/expected/major.json', 'utf8'));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should bump minor if options.bump = minor', function(done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/minor.yml',
      contents: fs.readFileSync('test/fixtures/minor.yml')
    });

    var bumpS = bump({type: 'minor'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.path);
      should.exist(newFile.contents);
      String(newFile.contents).should.equal(fs.readFileSync('test/expected/minor.yml', 'utf8'));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should set version to value specified by options.version', function(done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/package.json',
      contents: fixtureFile
    });

    var bumpS = bump({version: '1.0.0'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.path);
      should.exist(newFile.contents);
      String(newFile.contents).should.equal(fs.readFileSync('test/expected/version.json', 'utf8'));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should set the key to a custom version', function(done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/key.json',
      contents: fs.readFileSync('test/fixtures/key.json')
    });

    var bumpS = bump({key: 'appversion'});

    bumpS.once('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.path);
      should.exist(newFile.contents);
      String(newFile.contents).should.equal(fs.readFileSync('test/expected/key.json', 'utf8'));
      done();
    });
    bumpS.write(fakeFile);
  });
});
