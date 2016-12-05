

function ƒ (req, res) {
  res.end(" QUICK");
  process.stdout.write(" QUICK");
}


var port= +process.argv[2] || 1234;
var http= require('http');
http.globalAgent.maxSockets= 8192+2048;
http.createServer(ƒ).listen(port);
console.log('Fibonacci server (NO THREADS) running @port: '+ port);

