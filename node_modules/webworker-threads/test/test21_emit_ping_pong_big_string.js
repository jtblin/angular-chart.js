

var i= 23; //8MB
var big= "*";
while (i--) big+= big;

console.log("big.length is "+ big.length);

var i= 0;
var s= Date.now();
var o= require('../')
  .create()
  .eval(function boot () {
    thread.on('b', function (data) {
      thread.emit('a',data);
    });
  })
  .eval('boot()')
  .emit('b',big)
  .on('a', function (data) {
    o.emit('b',data);
    i+= 2;
  });


function display () {
  var e= Date.now()- s;
  var ppps= (i*1e3/e).toFixed(1);
  console.log("ping-pongs: "+ i+ ", ping-pongs-per-second: "+ ppps);
}

setInterval(display, 1e3);
