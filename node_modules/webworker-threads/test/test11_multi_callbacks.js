

var Threads= require('../');

function A (err, msg) {
  i++;
  this.eval('', B);
  process.stdout.write('A');
}

function B (err, msg) {
  i++;
  this.eval('', C);
  process.stdout.write('B');
}

function C (err, msg) {
  i++;
  this.eval('', A);
  process.stdout.write('C');
}

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

while (i--) {
  Threads.create().eval('0', A);
  process.stdout.write('.');
}

i= 0;
var t= Date.now();
setInterval(function display () {
  var e= Date.now()- t;
  var tps= (i*1e3/e).toFixed(1);
  process.stdout.write('\nt (ms) -> '+ e+ ', i -> '+ i+ ', tps -> '+ tps);
}, 1e3);

