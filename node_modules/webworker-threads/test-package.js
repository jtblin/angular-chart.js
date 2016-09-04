var Threads = require('./'),
    tap = require('tap');

tap.test('echo worker', function(t) {
  var echoWorker = new Threads.Worker(function() {
    this.onmessage = function(event) {
      this.postMessage(event.data);
    };
  });

  var echoData = 'asdf';
  echoWorker.onmessage = function(event) {
    t.equal(event.data, echoData);
    echoWorker.terminate();
    t.end();
  };

  echoWorker.postMessage(echoData);
});

tap.test('eval pool', function(t) {
  var tcount = 0;
  function test() {
    console.log('test function in thread pool');
  }

  var mypool = Threads.createPool(5);
  mypool.all.eval(test);
  mypool.all.eval('test()', function(err, data) {
    ++tcount;
    if (tcount == 5) {
      mypool.destroy();
      t.end();
    }
  });
});
