'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var should = require('should');
var gutil = require('gulp-util');

module.exports = function(git, util){

  beforeEach(function(done){
    var repo = 'git://github.com/stevelacy/gulp-git';
    git.clone(repo, {args: './test/tmp'}, done);
  });

  it('should have cloned project into tmp directory', function(){
    should.exist('./test/tmp/.git');
  });

  afterEach(function(done){
    rimraf('./test/tmp', function(err){
      if(err) return done(err);
      done();
    });
  });
};
