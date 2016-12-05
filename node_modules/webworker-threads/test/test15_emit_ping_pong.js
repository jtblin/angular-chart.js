var t= require('../');

function eventHandler (data) {
  ctr++;
  this.emit('b', 0);
}

function boot () {
  thread.on('b', eventHandler);
  
  function eventHandler (data) {
    thread.emit('a', 0);
  }
}

var ctr= 0;
var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

var pool= t.createPool(i);
pool.all.eval(boot).all.eval('boot()').on('a', eventHandler).all.emit('b', 0).all.emit('b', 0).all.emit('b', 0);


var s= Date.now();
function display () {
  var e= Date.now()- s;
  var ppps= (ctr*1e3/e).toFixed(1);
  console.log("ping-pongs: "+ ctr+ ", ping-pongs-per-second: "+ ppps);
}

setInterval(display, 1e3);
