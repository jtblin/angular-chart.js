

var Threads= require('../');

function ƒ () { return Math.random() }

var  i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

var threads= [];
var t= Date.now();
while (i--) {
  var thread= Threads.create().eval(ƒ);
  threads.push(thread);
}

i= 0;
(function loop () {
  threads.forEach(function (v) {
    i++;
    v.eval('ƒ()');
  });
  process.nextTick(loop); //segfaults
})();


(function display () {
  var e= Date.now()- t;
  var tps= (i*1e3/e).toFixed(1);
  console.log('t (ms) -> '+ e+ ', tps -> '+ tps+ ', i -> '+ i);
  setTimeout(display, 1e3);
})();
