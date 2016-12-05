

var Threads= require('../');

function cb (err, msg) {
  i++;
  this.eval(source, cb);
  //process.stdout.write('['+ this.id+ ']');
}


function ƒ () { }
var source= "ƒ()";

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');


while (i--) {
  Threads.create().eval(ƒ).eval(source, cb);
  process.stdout.write('.');
}

i= 0;
var t= Date.now();
function display () {
  var e= Date.now()- t;
  var tps= (i*1e3/e).toFixed(1);
  console.log('t (ms) -> '+ e+ ', i -> '+ i+ ', tps -> '+ tps);
}

setInterval(display, 1e3);
