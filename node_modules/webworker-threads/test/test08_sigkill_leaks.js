

var Thread= require('../');

function cb (e,m) {
  this.destroy();
  console.log('['+this.id+'].destroy()');
  //this.eval('0', cb);
  again();
}


function again () {
  Thread.create().eval('0', cb);
}


var i= +process.argv[2] || 1;
console.log('Using '+ i+ ' threads');



while (i--) {
  again();
}


process.on('exit', function () {
  console.log("process.on('exit') -> BYE!");
});
