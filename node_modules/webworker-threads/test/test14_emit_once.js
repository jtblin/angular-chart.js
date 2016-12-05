

var t= require('../');

function killHandler (data) {
  console.log("GOT KILL with data -> "+ data);
  o.destroy();
}

function boot () {
  thread.once('kill', function (data) {
    thread.emit('kill', data);
  });
}

o= t.create().once('kill', killHandler).eval(boot).eval('boot()').emit('kill', "*** DATA");

process.on('exit', function () {
  console.log("Bye!");
});
