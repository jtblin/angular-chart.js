

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


var port= +process.argv[2] || 1234;
var http= require('http');
http.globalAgent.maxSockets= 8192+2048;
http.createServer(ƒ).listen(port);
console.log('Fibonacci server (NO THREADS) running @port: '+ port);

