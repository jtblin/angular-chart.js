var Threads= require('../');

function cb (err, msg) {
  if (err) {
    process.stdout.write("["+ this.id+ "] -> "+ err+ '\n');
  }
  this.destroy();
}

function ƒ () {
  var prefix= "["+ thread.id+ "] -> ";
  puts(prefix+ "1\n", prefix+ "2\n", prefix+ "3\n", prefix+ "4\n", prefix+ "5\n");
}

var i= Math.abs(parseInt(process.argv[2], 10)) || 1;
console.log('Using '+ i+ ' threads');

Threads.createPool(i).all.eval(ƒ).all.eval('ƒ()', cb);
