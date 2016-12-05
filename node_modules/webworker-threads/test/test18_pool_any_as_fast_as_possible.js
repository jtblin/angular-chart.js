

var T= require('../');

var i= Math.floor(process.argv[2]) || 1;
console.log("Creating a pool of "+ i+ " threads");

var pool= T.createPool(i);
pool.all.eval(ƒ);

function ƒ () { return 3.14 }

var ctr= 0;
function cb (err, data) {
  if (err) throw data;
  if (data !== '3.14') throw "*** BAD DATA ERROR -> "+ ['3.14', data];
  ctr++;
  if (threads[this.id]) {
    threads[this.id]+= 1;
  }
  else {
    threads[this.id]= 1;
  }
}

var threads= [];
i= Math.floor(process.argv[3]) || 4e5;
console.log("The pool will run "+ ƒ+ ' '+ i+ " times\n");
while (i--) {
  pool.any.eval("ƒ()", cb);
}

var t= Date.now();
function display () {
  var e= Date.now()- t;
  var tps= (ctr*1e3/e).toFixed(1);
  console.log("threadsPerSecond: "+ tps+ ', pool.pendingJobs: '+ pool.pendingJobs()+ ', pool.idleThreads: '+ pool.idleThreads());
  console.log("distribution    : "+ threads.join('+ ')+ "= "+ ctr+ "\n");
  if (!pool.pendingJobs()) {
    pool.destroy();
    clearInterval(interval);
    console.log("Done, BYE !");
  }
}

var interval= setInterval(display, 1e3);

