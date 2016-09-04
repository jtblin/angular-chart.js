var i= parseInt(process.argv[2], 10) || 2;
var pool= require('../').createPool(i);
console.log("Using "+ i+ " threads.");

function program () {
  var i= 0;
  function ƒ () {
    puts(" ["+ thread.id+ "]"+ (++i));
    thread.nextTick(ƒ);
  }
  ƒ();
}

pool.all.eval(program).all.eval('program()');
