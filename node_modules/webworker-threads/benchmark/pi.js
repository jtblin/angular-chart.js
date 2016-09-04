

var Threads= require('threads_a_gogo');


function cb (err, msg) {
  this.destroy();
  ++i;
  process.stdout.write('\n'+ msg + ' -> '+ this.id);
}

function pi () {
  var π= 0;
  var num= 4;
  var den= 1;
  var plus= true;

  while (den < 5e7) {
    if (plus) {
      π+= num/den;
      plus= false;
    }
    else {
      π-= num/den;
      plus= true;
    }
    den+= 2;
  }
  return π;
}


var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');


var t= Date.now();
while (i--) {
  Threads.create().eval('('+ pi+ ')()', cb);
}


i= 0;
process.on('exit', function () {
  t= Date.now()- t;
  var tps= (i*1e3/t).toFixed(1);
  console.log('\nTiempo total (ms) -> '+ t);
  console.log('Threads por segundo -> '+ tps);
  console.log('Total de threads ejecutadas -> '+ i);
});
