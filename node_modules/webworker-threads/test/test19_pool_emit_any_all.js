

var T= require('../');

var i= process.argv[2] || 1;
console.log("Creating a pool of "+ i+ " threads");

var pool= T.createPool(i);

pool.all.eval('('+ ƒ+ ')()');

pool.on('myEvent', function myEventHandler (data) {
  console.log("Received myEvent with data -> "+ data);
  if (data === "QUIT") {
    setTimeout(function () { pool.destroy() }, 1e3);
  }
});

function ƒ () {
  thread.on('myEvent', function cb (data) {
    thread.emit('myEvent', data);
  });
}


console.log("pool.any.emit('myEvent', 'POOL.ANY')");
pool.any.emit('myEvent', "POOL.ANY");

console.log("pool.all.emit('myEvent', 'POOL.ALL')");
pool.all.emit('myEvent', "POOL.ALL");

console.log("pool.any.emit('myEvent', 'QUIT')");
pool.any.emit('myEvent', "QUIT");

process.on('exit', function () {
  console.log("BYE !");
});
