

var Thread= require('../');

function cb (e,m) {
  console.log([e,m]);
  this.destroy();
  throw('An error');
}

Thread.create().eval('0', cb);

process.on('uncaughtException', function () {
  console.log('OK, BYE!');
})
