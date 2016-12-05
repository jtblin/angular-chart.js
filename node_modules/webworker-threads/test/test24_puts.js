var Threads= require('../');

function cb (err, msg) {
  if (err) {
    process.stdout.write("["+ this.id+ "] -> "+ err+ '\n');
  }
  this.destroy();
}

function ƒ () {
  puts("["+ thread.id+ "] -> puts('Hello!')\n");
}

var i= Math.abs(parseInt(process.argv[2], 10)) || 1;
console.log('Using '+ i+ ' threads');

Threads.createPool(i).all.eval(ƒ).all.eval('ƒ()', cb);
