

function fib (n) {
  return (n < 2) ? 1 : fib(n-2)+ fib(n-1);
}

//We're going to use n threads
var numThreads= +process.argv[3] || 1;
console.log("Using a POOL of "+ numThreads+ " threads");

var pool= require('threads_a_gogo').createPool(numThreads).all.eval(fib);

var i= 0;
var n= 35;
function ƒ (req, res) {
  if ((++i) % 10) {
    res.end(" QUICK");
    process.stdout.write(" QUICK");
  }
  else {
    pool.any.eval('fib('+ n+ ')', function cb (err, data) {
      if (err) throw err;
      var txt= ' '+ data;
      res.end(txt);
      process.stdout.write(txt);
    });
  }
}


var port= +process.argv[2] || 1234;
var http= require('http');
http.globalAgent.maxSockets= 8192+2048;
http.createServer(ƒ).listen(port);
console.log('Fibonacci server (WITH A THREAD POOL) running @port: '+ port);

