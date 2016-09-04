

var Threads= require('../');


function cb (err, data) {
  ++i;
  console.log('['+ this.id+ '] -> '+ data);
  this.destroy();
}

function ƒ () { return Math.random() }

var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');

var t= Date.now();
while (i--) {
  Threads.create().eval(ƒ).eval('ƒ()', cb);
}

i= 0;
process.on('exit', function () {
  t= Date.now()- t;
  console.log('THREADS PER SECOND -> '+ (i*1e3/t).toFixed(1));
  console.log('BYE !');
});
