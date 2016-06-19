'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var should = require('should');
var gutil = require('gulp-util');

module.exports = function(git, util){

  it('should remove the Remote origin from the git repo', function(done) {
    var opt = {cwd: './test/repo/'};
    git.removeRemote('origin', opt, function(){
      should.exist('./test/repo/.git/');
      fs.readFileSync('./test/repo/.git/config')
        .toString('utf8')
        .should.not.match(/https:\/\/github.com\/stevelacy\/git-test/);
      done();
    });
  });

};
