

var Threads= require('../');

function cb (err, msg) {
  i++;
  threads[this.id]++;
  this.eval(source, cb);
  //process.stdout.write('['+ this.id+ ']');
}


function ƒ () { }
var source= "ƒ()";

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

var threads= [];
while (i--) {
  threads[i]= 0;
  Threads.create().eval(ƒ)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb)
  .eval(source, cb);
  process.stdout.write('.');
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

function pi () {
  var π= 0;
  var num= 4;
  var den= 1;
  var plus= true;

  while (den < 1e6) {
    if (plus) {
      π+= num/den;
      plus= false;
    }
    else {
      π-= num/den;
      plus= true;
    }
    den+= 2;
  }
  return π;
}
