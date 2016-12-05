(function spinForever () {
  process.stdout.write(".");
  setImmediate(spinForever);
})();
