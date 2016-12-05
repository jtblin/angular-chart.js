

function fib (n) {
  return (n < 2) ? 1 : fib(n-2)+ fib(n-1);
}

//We're going to use n threads
var numThreads= +process.argv[3] || 1;
console.log("Using "+ numThreads+ " threads");

var threads= [];
var round_robin= 0;
var t= require('threads_a_gogo');
while (numThreads--) {
  threads.push(t.create().eval(fib));
}

var i= 0;
var n= 35;
function ƒ (req, res) {
  if ((++i) % 10) {
    res.end(" QUICK");
    process.stdout.write(" QUICK");
  }
  else {
    round_robin= (++round_robin) % threads.length;
    threads[round_robin].eval('fib('+ n+ ')', function cb (err, data) {
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
console.log('Fibonacci server (WITH THREADS) running @port: '+ port);

