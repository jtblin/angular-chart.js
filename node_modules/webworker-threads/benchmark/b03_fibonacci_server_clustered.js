

function fib (n) {
  return (n < 2) ? 1 : fib(n-2)+ fib(n-1);
}

var i= 0;
var n= 35;
function ƒ (req, res) {
  if ((++i) % 10) {
    res.end(" QUICK");
    process.stdout.write(" QUICK");
  }
  else {
    var txt= ' '+ fib(n);
    res.end(txt);
    process.stdout.write(txt);
  }
}

var cluster = require('cluster');
if (cluster.isMaster) {
  require('http').globalAgent.maxSockets= 8192+2048;
  var numCPUs = process.argv[3] || 1;
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
} else {
  var port= + process.argv[2] || 1234;
  var http= require('http');
  http.globalAgent.maxSockets= 8192+2048;
  http.createServer(ƒ).listen(port);
  console.log('Fibonacci server (CLUSTERED) listening: ' + port);
}

