

var Threads= require('../');

function A (err, msg) {
  ctrA++;
  this.eval(sourceText, A);
  //process.stdout.write("\nA -> "+ msg);
}

function B (err, msg) {
  ctrB++;
  this.eval(precompiled, B);
  //process.stdout.write("\nB -> "+ msg);
}

function ƒ () { return Math.random()* 10 }

var sourceText= '('+ ƒ+ ')()';
var precompiled= Threads.preCompile(sourceText);
var i= +process.argv[2] || 1;
console.log('Using '+ (i*2)+ ' threads');

while (i--) {
  var a= Threads.create();
  var b= Threads.create();
  b.eval(precompiled, B);
  a.eval(sourceText, A);
  process.stdout.write('.');
}

ctrA= 0;
ctrB= 0;
var t= Date.now();
setInterval(function display () {
  var e= Date.now()- t;
  var tps= ((ctrA+ctrB)*1e3/e).toFixed(1);
  var tpsA= (ctrA*1e3/e).toFixed(1);
  var tpsB= (ctrB*1e3/e).toFixed(1);
  process.stdout.write('\nt (ms) -> '+ e+ ', i -> '+ i+ ', tps -> '+ tps+ ', tpsA -> '+ tpsA+ ', tpsB -> '+ tpsB);
}, 1e3);

