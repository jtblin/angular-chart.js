

var t= require('../');

function eHandler (data) {
  console.log("TEST FAIL");
}

function boot () {
  thread.on('e', function (data) {
    thread.emit('e', 0);
  });
}

o= t.create().once('e', eHandler).on('e', eHandler).eval(boot).eval('boot()').emit('e', 0).removeAllListeners();

setTimeout(function () {
  o.destroy();
}, 1e3);

process.on('exit', function () {
  console.log("OK: Bye!");
});
