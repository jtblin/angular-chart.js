var Worker = require('webworker-threads').Worker;
var w = new Worker(function(){
    function fibo (n) {
      return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
    }
    self.onmessage = function (event) {
        self.postMessage( fibo( event.data ) );
    };
});
w.postMessage(Math.ceil(Math.random()*30));
w.onmessage = function cb (event) {
    process.stdout.write(event.data);
    w.postMessage(Math.ceil(Math.random()*30));
};
(function spinForever () {
    process.stdout.write(".");
    setImmediate(spinForever);
})();
