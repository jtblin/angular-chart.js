

var Thread= require('../');

function cb (e,m) {
  process.stdout.write('[ '+ e+ ', '+ m+ ' ]\n');
  this.eval(src, cb);
}

var src= 'if (++i % 2) throw("An error -> "+ i); else ("No error -> "+ i);';

Thread.create().eval('i=0').eval(src, cb);
