

var Thread= require('../');

function cb (e,m) {
  process.stdout.write('[ '+ e+ ', '+ m+ ', '+ (i++)+ ' ]\n');
  this.eval(syntaxError, cb);
}

var i= 0;
var syntaxError= 'if return then goto 1';

Thread.create().eval(syntaxError, cb);
