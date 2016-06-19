/* jshint node: true */
/* global describe, it, beforeEach */
'use strict';

var header = require('../');
var should = require('should');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var File = require('vinyl');
var gulp = require('gulp');
require('mocha');

describe('gulp-header', function() {
  var fakeFile;

  function getFakeFile(fileContent){
    return new File({
      path: './test/fixture/file.txt',
      cwd: './test/',
      base: './test/fixture/',
      contents: new Buffer(fileContent || '')
    });
  }

  function getFakeFileReadStream(){
    return new File({
      contents: es.readArray(['Hello world']),
      path: './test/fixture/anotherFile.txt'
    });
  }

  beforeEach(function(){
    fakeFile = getFakeFile('Hello world');
  });

  describe('header', function() {

    it('file should pass through', function(done) {
      var file_count = 0;
      var stream = header();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.txt');
        newFile.relative.should.equal('file.txt');
        newFile.contents.toString('utf8').should.equal('Hello world');
        ++file_count;
      });

      stream.once('end', function () {
        file_count.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('should prepend the header to the file content', function(done) {
      var myHeader = header('And then i said : ');

      myHeader.write(fakeFile);

      myHeader.once('data', function(file) {
        should(file.isBuffer()).ok;
        should.exist(file.contents);
        file.contents.toString('utf8').should.equal('And then i said : Hello world');
        done();
      });
      myHeader.end();
    });

    it('should prepend the header to the file content (stream)', function(done) {
      var myHeader = header('And then i said : ');

      myHeader.write(getFakeFileReadStream());

      myHeader.once('data', function(file) {
        should(file.isStream()).ok;
        file.contents.pipe(es.wait(function(err, data) {
          data.toString('utf8').should.equal('And then i said : Hello world');
          done();
        }));
      });
      myHeader.end();
    });

    it('should format the header', function(done) {
      var stream = header('And then <%= foo %> said : ', { foo : 'you' } );
      //var stream = header('And then ${foo} said : ', { foo : 'you' } );
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString('utf8').should.equal('And then you said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('should format the header (ES6 delimiters)', function(done) {
      var stream = header('And then ${foo} said : ', { foo : 'you' } );
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString('utf8').should.equal('And then you said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('should access to the current file', function(done) {
      var stream = header([
        '<%= file.relative %>',
        '<%= file.path %>',
        ''].join('\n'));
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString('utf8').should.equal('file.txt\n./test/fixture/file.txt\nHello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('multiple files should pass through', function (done) {
      var headerText = 'use strict;',
          stream = gulp.src('./test/fixture/*.txt').pipe(header(headerText)),
          files = [];

      stream.on('error', done);
      stream.on('data', function(file) {
        file.contents.toString('utf8').should.startWith(headerText);
        files.push(file);
      });
      stream.on('end', function() {
        files.length.should.equal(2);
        done();
      });
    });

    it('no files are acceptable', function (done) {
      var headerText = 'use strict;',
          stream = gulp.src('./test/fixture/*.html').pipe(header(headerText)),
          files = [];

      stream.on('error', done);
      stream.on('data', function(file) {
        files.push(file);
      });
      stream.on('end', function() {
        files.length.should.equal(0);
        done();
      });
    });
  });

});
