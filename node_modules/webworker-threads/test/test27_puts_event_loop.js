var i= parseInt(process.argv[2], 10) || 2;
var pool= require('../').createPool(i);
console.log("Using "+ i+ " threads.");

pool.on('again', function onAgain () {
  this.eval('ƒ()');
});

function ƒ () {
  puts(" ["+ thread.id+ "]"+ (++i));
  thread.emit('again');
}

pool.all.eval(ƒ).all.eval('i=0').all.eval('ƒ()');
