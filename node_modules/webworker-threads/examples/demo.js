var http= require('http');

function fibo (n) {
  return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

function fast (req,res) {
  process.stdout.write('·');
  res.end("FAST");
}

function slow (req,res) {
  process.stdout.write('•');
  res.end("SLOW -> "+ fibo(40));
}

var numThreads= parseInt(process.argv[2], 10) || 5;
console.log("Using "+ numThreads+ " threads.");
var Worker= require('webworker-threads');
var threadPool= Worker.createPool(numThreads).all.eval(fibo);

function tagg (req,res) {
  threadPool.any.eval('fibo(40)', function (err, data) {
    process.stdout.write('❚');
    res.end("TAGG -> "+ data); //Threads A GoGo
  });
}

http.createServer(fast).listen(12345), console.log("fast @ localhost:12345");
http.createServer(slow).listen(12346), console.log("slow @ localhost:12346");
http.createServer(tagg).listen(12347), console.log("useThreads @ localhost:12347");
