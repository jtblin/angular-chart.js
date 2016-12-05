

var Threads= require('../');

console.log('Launch with/without --expose_gc to compare memory usage')

function cb (err, msg) {
  i++;
  if (msg) console.log('['+ this.id+ ']'+ msg);
  this.eval(source, cb);
  //process.stdout.write('['+ this.id+ ']['+ i+ '] -> '+ msg+ '\n');
  //process.stdout.write('['+ this.id+ ']');
}


function ƒ () {
  if (++i % 10e3) return '';
  try {
    gc();
    return ' -> gc()'
  }
  catch (e) {
    return ' -> *NOT* gc()]';
  }
}
var source= "ƒ()";

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');


while (i--) {
  Threads.create().eval(ƒ+ '\nvar i= 0;').eval(source, cb);
}

i= 0;
var t= Date.now();
function display () {
  var e= Date.now()- t;
  var tps= (i*1e3/e).toFixed(1);
  console.log('t (ms) -> '+ e+ ', i -> '+ i+ ', tps -> '+ tps);
}

setInterval(display, 1e3);
