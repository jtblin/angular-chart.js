'use strict';

var tmp         = exports;
var node_path   = require('path');
var fs          = require('fs-sync'); 


// by name
tmp._dir = function (dir) {
    dir = node_path.resolve(dir);

    if(!fs.isDir(dir)){
        fs.mkdir(dir);
    }

    tmp.mark(dir);

    return dir;
};


// genarate an random name inside a directory
tmp.in = function (root) {
    root = root || require('osenv').tmpdir();
    // Everytime it returns a different directory
    var dir = node_path.join(
        root,
        'tmp-' 
            + process.pid + '-'
            + Number( '' + Date.now() + Math.random() * 0x1000000000 ).toString(36)
    );

    return tmp._dir(dir);
};


tmp.mark = function (dir) {
    temp_dirs.push( node_path.resolve(dir) );
};


tmp.clean = function () {
    temp_dirs.forEach(fs.remove);
    temp_dirs.length = 0;
};


var temp_dirs = [];


process.on('exit', function () {
    tmp.clean();
});

