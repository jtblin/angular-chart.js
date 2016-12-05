var fs = require('fs-sync');
var dir = __dirname;

console.log(dir);

console.log(fs.expand('**', {cwd: dir }));