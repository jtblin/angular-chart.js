

var Threads= require('../');

function cb (err, msg) {
  ++i;
  process.stdout.write('['+ this.id+ ']['+ i+ '] -> '+ msg+ '\n');
  //process.stdout.write('['+ this.id+ ']');
}

function ƒ () { while (1) {} }


var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

var threads= [];
var t= Date.now();
while (i--) {
  Threads.create().eval(ƒ).eval('ƒ()', cb);
}


i= 0;
(function display () {
  var e= Date.now()- t;
  var tps= (i*1e3/e).toFixed(1);
  console.log('\nTiempo total (ms) -> '+ e);
  console.log('Threads por segundo -> '+ tps);
  console.log('Total de threads ejecutadas -> '+ i);
  setTimeout(display, 1e3);
})();
