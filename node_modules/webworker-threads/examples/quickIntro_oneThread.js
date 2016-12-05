function fibo (n) {
  return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

function cb (err, data) {
  process.stdout.write(data);
  this.eval('fibo(35)', cb);
}

var thread= require('webworker-threads').create();

thread.eval(fibo).eval('fibo(35)', cb);

(function spinForever () {
  process.stdout.write(".");
  setImmediate(spinForever);
})();
