var i= parseInt(process.argv[2], 10) || 2;
var pool= require('../').createPool(i);
console.log("Using "+ i+ " threads.");

function ƒ () {
  puts(" ["+ thread.id+ "]"+ (++i));
  //if (!(i%1e3)) gc();
}

function callback (err, data) {
  this.eval('ƒ()', callback);
}

pool.all.eval('i=0').all.eval(ƒ).all.eval('ƒ()', callback);
