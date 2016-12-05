

var T= require('../');

var i= process.argv[2] || 1;
console.log("Creating a pool of "+ i+ " threads");

var pool= T.createPool(i);

pool.all.eval(pi);

function pi () {
  var π= 0;
  var num= 4;
  var den= 1;
  var plus= true;

  while (den < 1e7) {
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

var piValue= pi()+ '';
var ctr= 0;
function cb (err, data) {
  if (err) throw data;
  if (data !== piValue) throw "*** BAD DATA -> "+ [piValue, data];
  ctr++;
  if (threads[this.id]) {
    threads[this.id]+= 1;
  }
  else {
    threads[this.id]= 1;
  }
}

var threads= [];
i= Math.floor(process.argv[3]) || 1e3;
console.log("The pool will run "+ pi+ ' '+ i+ " times\n");
while (i--) {
  pool.any.eval("pi()", cb);
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

