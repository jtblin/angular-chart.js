function fibo (n) {
  return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

function cb (err, data) {
  process.stdout.write(" ["+ this.id+ "]"+ data);
  this.eval('fibo(35)', cb);
}

var Worker= require('webworker-threads');

Worker.create().eval(fibo).eval('fibo(35)', cb);
Worker.create().eval(fibo).eval('fibo(35)', cb);
Worker.create().eval(fibo).eval('fibo(35)', cb);
Worker.create().eval(fibo).eval('fibo(35)', cb);
Worker.create().eval(fibo).eval('fibo(35)', cb);

(function spinForever () {
  process.stdout.write(".");
  setImmediate(spinForever);
})();
