

var Threads= require('../');

function ƒ () {
  var i= 0;
  var t= Date.now();
  
  (function ƒ () {
    thread.nextTick(ƒ);
    
    if ((++i % 1e6) === 0) {
      var e= Date.now()- t;
      var cps= (i*1e3/e).toFixed(1);
      thread.emit("data", cps);
    }
  })();

}

function onData (data) {
  console.log(data);
}

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

while (i--) {
  Threads.create().on('data', onData).eval(ƒ).eval('ƒ()');
  process.stdout.write('.');
}
