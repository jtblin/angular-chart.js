var fs = require('fs-sync');
var path = require('path');

var a = path.join(__dirname, 'a/');
var b = path.join(__dirname, 'b/');

fs.copy(a, b, {force: true});