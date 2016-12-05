function fibo (n) {
  return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

var numThreads= 10;
var threadPool= require('webworker-threads').createPool(numThreads).all.eval(fibo);

threadPool.all.eval('fibo(35)', function cb (err, data) {
  process.stdout.write(" ["+ this.id+ "]"+ data);
  this.eval('fibo(35)', cb);
});

(function spinForever () {
  process.stdout.write(".");
  setImmediate(spinForever);
})();
