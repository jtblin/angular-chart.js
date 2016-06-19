'use strict';

var File = require('vinyl');
var should = require('should');
var bump = require('..');

require('mocha');

describe('gulp-bump: Whitespace preserving', function() {

  var fixtureObj = { version: '1.0.0' };
  var expectedObj = { version: '1.0.1' };

  var createFile = function (tabType) {
    return new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/package.json',
      contents: new Buffer(JSON.stringify(fixtureObj, null, tabType))
    });
  };

  it('should preserve tab whitespace settings', function (done) {
    var fakeFile = createFile('\t');
    var bumpS = bump();

    bumpS.once('data', function(newFile) {
      String(newFile.contents).should.equal(JSON.stringify(expectedObj, null, '\t'));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should preserve spaces whitespace settings', function (done) {
    var fakeFile = createFile(3);
    var bumpS = bump();

    bumpS.once('data', function(newFile) {
      String(newFile.contents).should.equal(JSON.stringify(expectedObj, null, 3));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should override whitespace if indent defined', function (done) {
    var fakeFile = createFile(3);
    var bumpS = bump({ indent: 2 });

    bumpS.once('data', function(newFile) {
      String(newFile.contents).should.equal(JSON.stringify(expectedObj, null, 2));
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should preserve whitespace at end', function (done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/package.json',
      contents: new Buffer(JSON.stringify(fixtureObj, null, 2) +  '\n')
    });
    var bumpS = bump();

    bumpS.once('data', function(newFile) {
      String(newFile.contents.slice(-1)).should.equal('\n');
      done();
    });
    bumpS.write(fakeFile);
  });

  it('should not add new line to file', function (done) {
    var fakeFile = new File({
      base: 'test/',
      cwd: 'test/',
      path: 'test/fixtures/package.json',
      contents: new Buffer(JSON.stringify(fixtureObj, null, 2))
    });
    var bumpS = bump();

    bumpS.once('data', function(newFile) {
      String(newFile.contents.slice(-1)).should.not.equal('\n');
      done();
    });
    bumpS.write(fakeFile);
  });
});

