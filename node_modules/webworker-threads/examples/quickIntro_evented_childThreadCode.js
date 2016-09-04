function fibo (n) {
  return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}

thread.on('giveMeTheFibo', function onGiveMeTheFibo (data) {
  this.emit('theFiboIs', fibo(+data)); //Emits 'theFiboIs' in the parent/main thread.
});