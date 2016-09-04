

var Threads= require('../');

function cb (err, msg) {
  i++;
  ƒ();
  //process.stdout.write('['+ this.id+ ']');
}


function ƒ () { process.nextTick(cb) }

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

var threads= [];
while (i--) {
  ƒ();
}

i= 0;
var t= Date.now();
function display () {
  var e= Date.now()- t;
  var tps= (i*1e3/e).toFixed(1);
  process.stdout.write('\nt (ms) -> '+ e+ ', i -> '+ i+ ', tps -> '+ tps+ ', [ '+ threads.map(percent)+ ' ]');
  function percent (v) {
    return Math.round(v/i*100);
  }
}



setInterval(display, 1e3);
