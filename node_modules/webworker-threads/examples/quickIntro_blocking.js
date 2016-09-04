function fibo (n) {
  return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

(function fiboLoop () {
  process.stdout.write(fibo(35).toString());
  setImmediate(fiboLoop);
})();

(function spinForever () {
  process.stdout.write(".");
  setImmediate(spinForever);
})();
